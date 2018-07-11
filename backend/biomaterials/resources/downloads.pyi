import falcon

class DownloadsResource(object):
    def on_put(self, req: falcon.Request, resp: falcon.Response): ...

class DownloadResource(object):
    def on_get(self, req: falcon.Request, resp: falcon.Response, download_uuid: str): ...
