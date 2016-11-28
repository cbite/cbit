from falcon import Request, Response

class StudiesResource(object):
    def on_post(self, req: Request, resp: Response): ...