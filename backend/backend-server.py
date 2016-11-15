#! /usr/bin/env gunicorn -c config/gunicorn-config.py -w 4 backend-server:app

import falcon
from middleware.clean_old_uploads import CleanOldUploadsMiddleware
from middleware.cors import CORSMiddleware
from middleware.database_session import DatabaseSessionMiddleware
from resources.uploads import UploadResource, UploadsResource

app = falcon.API(middleware=[
    CORSMiddleware(),
    DatabaseSessionMiddleware(),
    CleanOldUploadsMiddleware()
])

app.add_route('/uploads', UploadsResource())
app.add_route('/uploads/{upload_uuid}', UploadResource())