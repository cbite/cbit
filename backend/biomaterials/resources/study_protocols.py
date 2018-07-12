import os
import config.config as cfg
import falcon
import zipfile
import elasticsearch

from biomaterials.data.archive import read_archive

class BiomaterialsStudyProtocolsResource(object):
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

        studyArchivePath = os.path.join(cfg.FILES_PATH, study_uuid, 'archive.zip')

        if os.path.exists(studyArchivePath):
            a = read_archive(studyArchivePath)
            # TODO@MT switch this to the protocols file
            with zipfile.ZipFile(studyArchivePath, "r") as archiveZf:
                file_content = archiveZf.read(a.investigation_file_name)
                resp.content_type = 'text/plain'
                resp.append_header("Content-Disposition", 'attachment; filename="{0}"'.format(a.investigation_file_name))
                resp.stream = file_content
                resp.stream_len = len(file_content)
        else:
            raise falcon.HTTPNotFound(description="No archive found for study id {0}".format(study_uuid))
