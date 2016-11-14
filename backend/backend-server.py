#! /usr/bin/env gunicorn -c backend-server-config.py -w 4 backend-server:app

import falcon
import json
import mimetypes
import uuid
import os
from falcon_cors import CORS

storage_path = 'files'
try:
    os.makedirs(storage_path)
except OSError:
    pass

class StudiesResource(object):
    def on_post(self, req, resp):
        ext = mimetypes.guess_extension(req.content_type)
        filename = '{uuid}{ext}'.format(uuid=uuid.uuid4(), ext=ext)
        filepath = os.path.join(storage_path, filename)

        with open(filepath, 'wb') as f:
            while True:
                chunk = req.stream.read(4096)
                if not chunk:
                    break
                f.write(chunk)

        study_id = '5'
        resp.status = falcon.HTTP_CREATED
        resp.location = '/studies/{0}/{1}'.format(study_id, filename)


class StudyResource(object):
    def on_get(self, req, resp, study_id):
        """Get a particular study by id"""

        if study_id in ('1', '2'):
            resp.status = falcon.HTTP_OK
            resp.body = json.dumps({'study': study_id, 'accept': req.accept, 'contents': "Hello, World!"}, indent=2, sort_keys=True)
        else:
            raise falcon.HTTPNotFound(title='No such study, {0}'.format(study_id))



# Set up REST endpoint
cors_origins = ['http://localhost:8080']
cors = CORS(
    allow_origins_list=cors_origins,
    allow_credentials_origins_list=cors_origins,
    allow_all_methods=True,
    allow_all_headers=True
)  # see https://pypi.python.org/pypi/falcon-cors for CORS info
app = falcon.API(middleware=[cors.middleware])

studies = StudiesResource()
study = StudyResource()

app.add_route('/studies', studies)
app.add_route('/studies/{study_id}', study)