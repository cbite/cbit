import os
import config.config as cfg
import falcon
import elasticsearch

class StudyArchiveResource(object):
    def on_get(self, req, resp, study_uuid):

        # Check that study exists (and get visibility in the process)
        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        try:
            results = es.get(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE,
                             id=study_uuid, _source=["*Visible"])
        except elasticsearch.NotFoundError:
            raise falcon.HTTPNotFound(description="Study ID {0} doesn't exist".format(study_uuid))

        # If not admin, check that study is visible
        if not req.context["isAdmin"]:
            if not results['_source']["*Visible"]:
                # TODO: Forbidden or Not Found?  For now, don't give a clue to non-admins about invisible studies
                raise falcon.HTTPNotFound(
                    description="Study ID {0} doesn't exist".format(
                        study_uuid))

        ingested_archive_path = os.path.join(cfg.FILES_PATH, study_uuid,
                                             'archive.zip')

        if os.path.exists(ingested_archive_path):
            resp.content_type = 'application/zip'
            resp.stream = open(ingested_archive_path, 'rb')
            resp.stream_len = os.path.getsize(ingested_archive_path)
        else:
            raise falcon.HTTPNotFound(description="No archive found for study id {0}".format(study_uuid))