import json
import os
import uuid
import shutil

import elasticsearch
import falcon

import config.config as cfg
from data import importer
from data.archive import read_archive
from data import reader
from data.fieldmeta import FieldMeta

import requests
import zipfile

# Possible upload statuses
UPLOAD_STATUS_UPLOADING = 'uploading'
UPLOAD_STATUS_UPLOADED = 'uploaded'
UPLOAD_STATUS_INGESTING = 'ingesting'
UPLOAD_STATUS_INGESTED = 'ingested'

class UploadsIRODSResource(object):
    def on_post(self, req, resp, folder_name):
        """
        Kick off an upload from iRODS
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(
                description="Only admins can perform this action")

        upload_uuid = '{upload_uuid}'.format(upload_uuid=uuid.uuid4())
        upload_dir = os.path.join(cfg.UPLOADS_PATH, upload_uuid)

        # Check for existence out of paranoia
        if os.path.exists(upload_dir):
            raise falcon.HTTPInternalServerError(description="UUID conflict, try again")

        # First note upload in database
        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute("INSERT INTO uploads (uuid, status) VALUES (%s, %s)",
                        (upload_uuid, UPLOAD_STATUS_UPLOADING))
        db_conn.commit()

        # List directory contents
        url = cfg.IRODS_BASE_URL + 'collection' + cfg.IRODS_BASE_DIR + "/" + folder_name + "?listing=true"
        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }

        ret = requests.get(url, headers=headers,
                           auth=requests.auth.HTTPBasicAuth(cfg.IRODS_USERNAME,
                                                            cfg.IRODS_PASSWORD))

        parsed = ret.json()

        fileFullPaths = [
            (item['parentPath'] + "/" + item['pathOrName'])
            for item in parsed['children']
            if (item['objectType'] == 'DATA_OBJECT' and item['pathOrName'] != 'metadata.xml')
        ]

        # Fetch each file in turn and plunk it into a temporary zip file
        os.makedirs(upload_dir)
        filepath = os.path.join(upload_dir, 'archive.zip')
        with zipfile.ZipFile(filepath, "w", zipfile.ZIP_DEFLATED) as zf:
            for fileFullPath in fileFullPaths:
                print(fileFullPath)
                url = cfg.IRODS_BASE_URL + 'fileContents' + fileFullPath
                headers = {
                    'Content-type': 'application/json',
                }

                ret = requests.get(url, headers=headers,
                                   auth=requests.auth.HTTPBasicAuth(cfg.IRODS_USERNAME,
                                                                    cfg.IRODS_PASSWORD))

                zf.writestr(os.path.basename(fileFullPath), ret.content)

        complete_upload(upload_uuid, db_conn, filepath, resp)


class UploadsResource(object):
    """
    Upload should work like this:

    - POST the archive to /uploads
      - returns a location like /uploads/{{uuid}} for interacting with upload
      - in the background, stores archive under /uploads/{{uuid}}
      - response body contains info about validity and unrecognised metadata
    - Front-end shows either errors or new metadata to prompt for types
    - PUT /uploads/{{uuid}} with correct & confirmed metadata
      - If correct, start ingestion of new study into databases
    - GET /uploads/{{uuid}} returns status of ingestion and should be queried repeatedly
      - when done, response body will include study ID as returned by ElasticSearch
    - After 24 hours, old uploads will be cleared from DB and disk

    Status of 403 (Forbidden) if the request is not made as an admin
    """

    def on_post(self, req, resp):

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(
                description="Only admins can perform this action")

        upload_uuid = '{upload_uuid}'.format(upload_uuid=uuid.uuid4())
        upload_dir = os.path.join(cfg.UPLOADS_PATH, upload_uuid)

        # Check for existence out of paranoia
        if os.path.exists(upload_dir):
            raise falcon.HTTPInternalServerError(description="UUID conflict, try again")

        # First note upload in database
        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute("INSERT INTO uploads (uuid, status) VALUES (%s, %s)",
                        (upload_uuid, UPLOAD_STATUS_UPLOADING))
        db_conn.commit()

        # Now dump file into temporary space
        # TODO: Support multipart/form-data instead?
        # TODO: Enforce maximum file size?
        os.makedirs(upload_dir)
        filepath = os.path.join(upload_dir, 'archive.zip')
        with open(filepath, 'wb') as f:
            while True:
                chunk = req.stream.read(4096)
                if not chunk:
                    break
                f.write(chunk)

        complete_upload(upload_uuid, db_conn, filepath, resp)


def complete_upload(upload_uuid, db_conn, filepath, resp):
    """
    Common ending of upload first step for iRODS and file uploads
    """

    # Mark upload as completed in database
    with db_conn.cursor() as cur:
        cur.execute("UPDATE uploads " +
                    "SET status = %s " +
                    "WHERE uuid = %s",
                    (UPLOAD_STATUS_UPLOADED, upload_uuid))
    db_conn.commit()

    # Check that archive is valid
    try:
        a = read_archive(filepath, only_metadata=False)
    except Exception as e:
        raise falcon.HTTPBadRequest(
            description="Malformed archive: {0}".format(str(e))
        )

    # Enumerate all fields in upload
    #d = reader.apply_special_treatments_to_study_sample(
    #    reader.join_study_sample_and_assay(
    #        reader.clean_up_study_samples(a.study_sample),
    #        reader.clean_up_assay(a.assay)
    #    )
    #)
    #
    #fieldNames = set(('Sample Name',))
    #for i, (k, v) in enumerate(d.iteritems()):
    #    fieldNames = fieldNames.union(set(v.keys()))

    # Analyze fields
    fieldAnalyses = a.analyse_fields()
    fieldNames = set([f.fieldName for f in fieldAnalyses])

    # Check for which fields we don't yet have metadata
    with db_conn.cursor() as cur:
        knownFields = FieldMeta.from_db_multi(cur, fieldNames)

    unknownFields = fieldNames.difference([f.fieldName for f in knownFields])

    # Final response
    resp.status = falcon.HTTP_CREATED
    resp.location = '/uploads/{0}'.format(upload_uuid)
    resp_json = {
        'upload_uuid': upload_uuid,
        'status': UPLOAD_STATUS_UPLOADED,
        'location': cfg.URL_BASE + resp.location,
        'fieldNames': list(fieldNames),
        'knownFields': {
            f.fieldName: f.to_json()
            for f in knownFields
        },
        'unknownFields': list(unknownFields),
        'fieldAnalyses': [f.to_json() for f in fieldAnalyses]
    }
    resp.body = json.dumps(resp_json, indent=2, sort_keys=True)


class UploadResource(object):
    def on_get(self, req, resp, upload_uuid):
        """Get info about a particular upload"""

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(
                description="Only admins can perform this action")

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
        """
        Kick off ingestion of uploaded file & provide typing info for new metadata

        Request data
        ============
        {
          "publicationDate": "2016-12-01",
          "visible": true
        }
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(
                description="Only admins can perform this action")

        # 0. Get payload
        data = json.load(req.stream)
        if not isinstance(data, dict):
            raise falcon.HTTPBadRequest(description="Expected JSON object as payload")

        publicationDate = data['publicationDate']
        visible = data['visible']

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

        # 3. Ingest archive into DBs
        uploaded_archive_path = os.path.join(cfg.UPLOADS_PATH, upload_uuid, 'archive.zip')
        try:
            self._ingest_archive(uploaded_archive_path, db_conn, upload_uuid, publicationDate, visible)
        except ValueError as e:
            import traceback
            tb = traceback.format_exc()

            # Ingest failed, go back to UPLOADED state
            with db_conn.cursor() as cur:
                cur.execute("UPDATE uploads " +
                            "SET status = %s " +
                            "WHERE uuid = %s",
                            (UPLOAD_STATUS_UPLOADED, upload_uuid))
            db_conn.commit()

            raise falcon.HTTPBadRequest(description=str(e) + '\ntraceback: ' + tb)

        # 4. Move archive .zip into place
        ingested_archive_path = os.path.join(cfg.FILES_PATH, upload_uuid, 'archive.zip')
        try:
            os.makedirs(os.path.dirname(ingested_archive_path))
        except os.FileExistsError:
            pass
        shutil.move(uploaded_archive_path, ingested_archive_path)
        shutil.rmtree(os.path.dirname(uploaded_archive_path))

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


    def _ingest_archive(self, filename, db_conn, study_uuid, publicationDate, visible):
        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        if not es.indices.exists(cfg.ES_INDEX):
            raise falcon.HTTPInternalServerError(description='ElasticSearch database not ready.  Have you run set_up_dbs.py?')

        importer.import_archive(db_conn, es, filename, study_uuid, publicationDate, visible)

