#! /usr/bin/env gunicorn -c backend-server-config.py -w 4 backend-server:app

import falcon
import json
import mimetypes
import uuid
import os
import psycopg2
import config
import shutil
import time
from falcon_cors import CORS
import elasticsearch
from elasticsearch import helpers
import importer

cfg = config.Config()

# Upload should work like this:
#
# - POST the archive to /uploads
#   - returns a location like /uploads/{{uuid}} for interacting with upload
#   - in the background, stores archive under /uploads/{{uuid}}
#   - response body contains info about validity and unrecognised metadata
# - Front-end shows either errors or new metadata to prompt for types
# - PUT /uploads/{{uuid}} with correct & confirmed metadata
#   - If correct, start ingestion of new study into databases
# - GET /uploads/{{uuid}} returns status of ingestion and should be queried repeatedly
#   - when done, response body will include study ID as returned by ElasticSearch
# - After 24 hours, old uploads will be cleared from DB and disk

class DatabaseSessionMiddleware(object):
    """
    Initiates a new DB connection for incoming request and closes it in the end.
    """

    def __init__(self, db_connection_maker):
        self.db_connection_maker = db_connection_maker

    def process_request(self, req, resp):
        req.context['db'] = self.db_connection_maker()

    def process_response(self, req, resp, resource):
        if 'db' in req.context:
            req.context['db'].close()

def connect_to_postgres():
    return psycopg2.connect(
        host=cfg.DB_HOST,
        port=cfg.DB_PORT,
        user=cfg.DB_USER,
        password=cfg.DB_PASS,
        database=cfg.DB_NAME
    )

# Possible upload statuses
UPLOAD_STATUS_UPLOADING = 'uploading'
UPLOAD_STATUS_UPLOADED = 'uploaded'
UPLOAD_STATUS_INGESTING = 'ingesting'
UPLOAD_STATUS_INGESTED = 'ingested'

uploads_path = 'uploads'
try:
    os.makedirs(uploads_path)
except OSError:
    pass

class CleanOldUploadsMiddleware(object):
    """
    Check for stale uploads at every request, remove those that are too old
    or have no entry in the database
    """

    def process_request(self, req, resp):
        if 'db' in req.context:
            db_conn = req.context['db']

            with db_conn.cursor() as cur:

                if os.path.exists(uploads_path):
                    local_uuids = os.listdir(uploads_path)
                else:
                    local_uuids = []

                if local_uuids:
                    local_uuids_query = " UNION ALL ".join(
                        "SELECT '{0}'::UUID AS uuid".format(_)
                        for _ in local_uuids
                    )
                else:
                    # We need a 0-row table with the correct schema...
                    local_uuids_query = \
                        "SELECT 'eb4cefac-94bc-4b71-8854-a4250c6cd874'::UUID AS uuid " \
                        "WHERE FALSE"

                query = (
                    """
                    WITH local_uuids AS (
                      {local_uuids_query}
                    )
                    SELECT remote.uuid remoteUuid, local.uuid localUuid
                    FROM
                        uploads AS remote
                      FULL OUTER JOIN
                        local_uuids AS local
                      ON remote.uuid = local.uuid
                    WHERE remote.uuid IS NULL
                       OR remote.createdOn < (CURRENT_TIMESTAMP - interval '{interval}')
                    """.format(
                        local_uuids_query=local_uuids_query,
                        interval=cfg.UPLOAD_STALE_INTERVAL
                    )
                )
                cur.execute(query)

                results = cur.fetchall()
                dead_remote_upload_uuids = [remote_uuid for (remote_uuid, _) in results if remote_uuid]
                dead_local_upload_uuids  = [local_uuid  for (_, local_uuid)  in results if local_uuid ]

                for upload_uuid in dead_local_upload_uuids:
                    upload_dir = os.path.join(uploads_path, upload_uuid)
                    if os.path.exists(upload_dir):
                        shutil.rmtree(upload_dir)

                if dead_remote_upload_uuids:
                    cur.execute("DELETE FROM uploads WHERE uuid IN %s",
                                [tuple(dead_remote_upload_uuids)])

            db_conn.commit()
        else:
            req.log_error('DatabaseSessionMiddleware should have opened a DB connection but it did not...')


class UploadsResource(object):
    def on_post(self, req, resp):
        upload_uuid = '{upload_uuid}'.format(upload_uuid=uuid.uuid4())
        upload_dir = os.path.join(uploads_path, upload_uuid)

        # Check for existence out of paranoia
        if os.path.exists(upload_dir):
            raise falcon.HTTPInternalServerError("UUID conflict, try again")

        # First note upload in database
        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute("INSERT INTO uploads (uuid, status) VALUES (%s, %s)",
                        (upload_uuid, UPLOAD_STATUS_UPLOADING))
        db_conn.commit()

        # Now dump file into temporary space
        # TODO: Support multipart/form-data instead?
        os.makedirs(upload_dir)
        filepath = os.path.join(upload_dir, 'archive.zip')
        with open(filepath, 'wb') as f:
            while True:
                chunk = req.stream.read(4096)
                if not chunk:
                    break
                f.write(chunk)

        # Mark upload as completed in database
        with db_conn.cursor() as cur:
            cur.execute("UPDATE uploads " +
                        "SET status = %s " +
                        "WHERE uuid = %s",
                        (UPLOAD_STATUS_UPLOADED, upload_uuid))
        db_conn.commit()

        # TODO: Check for metadata that we don't yet know about

        # Final response
        resp.status = falcon.HTTP_CREATED
        resp.location = '/uploads/{0}'.format(upload_uuid)


class UploadResource(object):
    def on_get(self, req, resp, upload_uuid):
        """Get info about a particular upload"""

        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute("SELECT status FROM uploads WHERE uuid = %s",
                        (upload_uuid,))
            result = cur.fetchone()

        if result:
            status = result[0]
            resp.status = falcon.HTTP_OK
            resp_json = \
                {
                    'upload_uuid': upload_uuid,
                    'status': status
                }
            resp.body = json.dumps(resp_json, indent=2, sort_keys=True)
        else:
            raise falcon.HTTPNotFound(description='No upload {0} in progress (or upload went stale after {1})'
                                      .format(upload_uuid, cfg.UPLOAD_STALE_INTERVAL))

    def on_put(self, req, resp, upload_uuid):
        """Kick off ingestion of uploaded file & provide typing info for new metadata"""

        # 1. Check that upload exists and it's status is 'uploaded'
        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute("SELECT status FROM uploads WHERE uuid = %s",
                        (upload_uuid,))
            result = cur.fetchone()

        if not result:
            raise falcon.HTTPNotFound(description='No upload {0} in progress (or upload went stale after {1})'
                                      .format(upload_uuid, cfg.UPLOAD_STALE_INTERVAL))

        status = result[0]
        if status != UPLOAD_STATUS_UPLOADED:
            if status == UPLOAD_STATUS_UPLOADING:
                raise falcon.HTTPBadRequest(description='Upload {0} still in progress, please GET /uploads/{0} until status is "{1}"'
                                            .format(upload_uuid, UPLOAD_STATUS_UPLOADED))
            else:
                raise falcon.HTTPBadRequest(description='Unexpected status for upload {0}.  Expected {1}, saw {2}'
                                            .format(upload_uuid, UPLOAD_STATUS_UPLOADED, status))

        # 2. Change status to ingesting
        with db_conn.cursor() as cur:
            cur.execute("UPDATE uploads " +
                        "SET status = %s " +
                        "WHERE uuid = %s",
                        (UPLOAD_STATUS_INGESTING, upload_uuid))
        db_conn.commit()

        # 3. Ingest archive
        ingest_archive(os.path.join(uploads_path, upload_uuid, 'archive.zip'),
                       db_conn, upload_uuid)

        # 4. Change status to ingested
        with db_conn.cursor() as cur:
            cur.execute("UPDATE uploads " +
                        "SET status = %s " +
                        "WHERE uuid = %s",
                        (UPLOAD_STATUS_INGESTED, upload_uuid))
        db_conn.commit()

        # 5. Response
        resp.status = falcon.HTTP_OK
        resp_json = \
            {
                'upload_uuid': upload_uuid,
                'status': UPLOAD_STATUS_INGESTED
            }
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)


def ingest_archive(filename, db_conn, study_uuid):
    es = elasticsearch.Elasticsearch(
        hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

    if not es.indices.exists('cbit'):
        raise falcon.HTTPInternalServerError(description='ElasticSearch database not ready.  Have you run set_up_dbs.py?')

    importer.import_archive(cfg, db_conn, es, filename, study_uuid)


# Set up REST endpoint
cors_origins = ['http://localhost:8080']
cors = CORS(
    allow_origins_list=cors_origins,
    allow_credentials_origins_list=cors_origins,
    allow_all_methods=True,
    allow_all_headers=True
)  # see https://pypi.python.org/pypi/falcon-cors for CORS info
app = falcon.API(middleware=[
    cors.middleware,
    DatabaseSessionMiddleware(connect_to_postgres),
    CleanOldUploadsMiddleware()
])

uploads = UploadsResource()
upload = UploadResource()

app.add_route('/uploads', uploads)
app.add_route('/uploads/{upload_uuid}', upload)