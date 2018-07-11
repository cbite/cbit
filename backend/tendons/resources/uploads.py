import falcon


class TendonsUploadsResource(object):
    def on_post(self, req, resp):
        resp.status = falcon.HTTP_CREATED
