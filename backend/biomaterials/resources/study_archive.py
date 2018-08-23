import os
import shutil
import zipfile

import config.config as cfg
import falcon
import elasticsearch

class BiomaterialsStudyArchiveResource(object):
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

        ingested_archive_path = os.path.join(cfg.FILES_PATH, study_uuid,'archive.zip')

        download_archive_path = createDownloadArchive(ingested_archive_path)

        if os.path.exists(download_archive_path):
            resp.content_type = 'application/zip'
            resp.append_header("Content-Disposition", 'attachment; filename="study.zip"')
            resp.stream = open(download_archive_path, 'rb')
            resp.stream_len = os.path.getsize(download_archive_path)
        else:
            raise falcon.HTTPNotFound(description="No archive found for study id {0}".format(study_uuid))

def createDownloadArchive(zip_file_path):
    zip_name = os.path.basename(zip_file_path)
    zip_dir = os.path.dirname(zip_file_path)

    download_dir = os.path.join(zip_dir, 'download')

    if os.path.exists(download_dir):
        # If download dir exists -> clear it
        for the_file in os.listdir(download_dir):
            file_path = os.path.join(download_dir, the_file)
            if os.path.isfile(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path): shutil.rmtree(file_path)
    else:
         # If not -> create it
         os.makedirs(download_dir)

    # Create a temporary directory in the download dir
    temp_dir = os.path.join(download_dir, 'temp')
    os.makedirs(temp_dir)

    # Temporarily create a copy of the zip archive
    shutil.copy(zip_file_path, temp_dir)
    temp_zip_file_path = os.path.join(temp_dir, zip_name)
    download_zip_file_path = os.path.join(download_dir, zip_name)

    # Create a dir for the temporary archive content
    temp_zip_content_dir = os.path.join(temp_dir, 'arch')
    os.makedirs(temp_zip_content_dir)

    # Unzip the temporary archive
    temp_zip_ref = zipfile.ZipFile(temp_zip_file_path, 'r')
    temp_zip_ref.extractall(temp_zip_content_dir)
    temp_zip_ref.close()

    # Remove temporary zip archive
    os.remove(temp_zip_file_path)

    # Add the extra file
    detail_overview_file_path = os.path.join(cfg.COMMON_FILES_PATH,'Study detail and property overview_v9.xlsx')
    shutil.copy(detail_overview_file_path, temp_zip_content_dir)

    # Create new archive
    shutil.make_archive(download_zip_file_path.strip('.zip'), 'zip', temp_zip_content_dir)

    # Clean up temporary directory
    shutil.rmtree(temp_dir)

    return download_zip_file_path
