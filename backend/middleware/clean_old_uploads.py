import os
import shutil

import config.config as cfg


class CleanOldUploadsMiddleware(object):
    """
    Check for stale uploads at every request, remove those that are too old
    or have no entry in the database
    """

    def process_request(self, req, resp):
        if 'db' in req.context:
            db_conn = req.context['db']

            with db_conn.cursor() as cur:

                if os.path.exists(cfg.UPLOADS_PATH):
                    local_uuids = os.listdir(cfg.UPLOADS_PATH)
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
                    upload_dir = os.path.join(cfg.UPLOADS_PATH, upload_uuid)
                    if os.path.exists(upload_dir):
                        shutil.rmtree(upload_dir)

                if dead_remote_upload_uuids:
                    cur.execute("DELETE FROM uploads WHERE uuid IN %s",
                                [tuple(dead_remote_upload_uuids)])

            db_conn.commit()
        else:
            req.log_error('DatabaseSessionMiddleware should have opened a DB connection but it did not...')