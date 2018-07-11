import falcon


class TendonsStudiesResource(object):
    def on_get(self, req, resp):
        resp.status = falcon.HTTP_OK

    def on_post(self, req, resp):
        resp.status = falcon.HTTP_OK


class TendonsStudyResource(object):
    def on_get(self, req, resp, study_uuid):
        resp.status = falcon.HTTP_OK

    def on_delete(self, req, resp, study_uuid):
        resp.status = falcon.HTTP_OK
