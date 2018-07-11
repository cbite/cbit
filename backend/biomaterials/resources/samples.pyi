from falcon import Request, Response

class SamplesResource(object):
    def on_post(self, req: Request, resp: Response): ...