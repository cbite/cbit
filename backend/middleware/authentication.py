import falcon

class AuthenticationMiddleware(object):
    """
    Check if credentials are given & are valid for an admin.
    Sets req.context["isAdmin"] field to (true|false)
    """

    def process_request(self, req, resp):
        # TODO: Stub behaviour for now
        req.context["isAdmin"] = True