import os
import shutil

import config.config as cfg


class CleanOldStuffMiddleware(object):
    """
    Check for stale uploads/downloads at every request, remove those that are too old
    or have no entry in the database
    """

    def __init__(self, filesPath, tableName, staleInterval):
        self.filesPath = filesPath
        self.tableName = tableName
        self.staleInterval = staleInterval

    def process_request(self, req, resp):
        if 'db' in req.context:
            db_conn = req.context['db']

            with db_conn.cursor() as cur:

                if os.path.exists(self.filesPath):
                    local_uuids = os.listdir(self.filesPath)
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
                        {tableName} AS remote
                      FULL OUTER JOIN
                        local_uuids AS local
                      ON remote.uuid = local.uuid
                    WHERE remote.uuid IS NULL
                       OR remote.createdOn < (CURRENT_TIMESTAMP - interval '{interval}')
                    """.format(
                        tableName=self.tableName,
                        local_uuids_query=local_uuids_query,
                        interval=self.staleInterval
                    )
                )
                cur.execute(query)

                results = cur.fetchall()
                dead_remote_uuids = [remote_uuid for (remote_uuid, _) in results if remote_uuid]
                dead_local_uuids  = [local_uuid  for (_, local_uuid)  in results if local_uuid ]

                for oneUuid in dead_local_uuids:
                    dir = os.path.join(self.filesPath, oneUuid)
                    if os.path.exists(dir):
                        shutil.rmtree(dir)

                if dead_remote_uuids:
                    cur.execute("DELETE FROM {0} WHERE uuid IN %s".format(self.tableName),
                                [tuple(dead_remote_uuids)])

            db_conn.commit()
        else:
            req.log_error('DatabaseSessionMiddleware should have opened a DB connection but it did not...')


class CleanOldUploadsMiddleware(CleanOldStuffMiddleware):
    def __init__(self):
        super(CleanOldUploadsMiddleware, self).__init__(
            filesPath=cfg.UPLOADS_PATH,
            tableName='uploads',
            staleInterval=cfg.UPLOAD_STALE_INTERVAL
        )


class CleanOldDownloadsMiddleware(CleanOldStuffMiddleware):
    def __init__(self):
        super(CleanOldDownloadsMiddleware, self).__init__(
            filesPath=cfg.DOWNLOADS_PATH,
            tableName='downloads',
            staleInterval=cfg.DOWNLOAD_STALE_INTERVAL
        )