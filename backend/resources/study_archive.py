import os
import config.config as cfg
import falcon

class StudyArchiveResource(object):
    def on_get(self, req, resp, study_uuid):
        ingested_archive_path = os.path.join(cfg.FILES_PATH, study_uuid,
                                             'archive.zip')

        if os.path.exists(ingested_archive_path):
            resp.content_type = 'application/zip'
            resp.stream = open(ingested_archive_path, 'rb')
            resp.stream_len = os.path.getsize(ingested_archive_path)
        else:
            raise falcon.HTTPNotFound(description="No archive found for study id {0}".format(study_uuid))