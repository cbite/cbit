#! /usr/bin/env gunicorn -c config/gunicorn-config.py -w 4 backend-server:app

import falcon
from middleware.clean_old_uploads import CleanOldUploadsMiddleware
from middleware.cors import CORSMiddleware
from middleware.database_session import DatabaseSessionMiddleware
from resources.uploads import UploadResource, UploadsResource
from resources.study_archive import StudyArchiveResource
from resources.metadata import MetadataAllCountsResource

app = falcon.API(middleware=[
    CORSMiddleware(),
    DatabaseSessionMiddleware(),
    CleanOldUploadsMiddleware()
])

app.add_route('/uploads', UploadsResource())
app.add_route('/uploads/{upload_uuid}', UploadResource())

app.add_route('/studies/{study_uuid}/archive', StudyArchiveResource())

app.add_route('/metadata/all_counts', MetadataAllCountsResource())