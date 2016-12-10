import falcon
import hashlib
import base64

class AuthenticationMiddleware(object):
    """
    Check if credentials are given & are valid for an admin.
    Sets req.context["isAdmin"] field to (true|false)
    """

    def process_request(self, req, resp):
        assert isinstance(req, falcon.Request)

        if req.auth is None:
            req.context["isAdmin"] = False
            return

        # Adapted from talons.auth.basicauth.Identifier
        http_auth = req.auth
        try:
            auth_type, user_and_key = http_auth.split(' ', 1)
        except ValueError as err:
            msg = ("Basic authorize header value not properly formed. "
                   "Supplied header {0}. Got error: {1}")
            msg = msg.format(http_auth, str(err))
            raise falcon.HTTPBadRequest(description=msg)

        if auth_type.lower() != 'basic':
            msg = ("Don't understand anything except HTTP Basic Authentication. "
                   "Authentication method used: {0}").format(auth_type.lower())
            raise falcon.HTTPBadRequest(description=msg)

        try:
            user_and_key = user_and_key.strip()
            user_and_key = base64.decodestring(user_and_key)
            user_id, key = user_and_key.split(':', 1)
        except ValueError as err:
            msg = ("Unable to determine user and pass/key encoding. "
                   "Got error: {0}").format(str(err))
            raise falcon.HTTPBadRequest(description=msg)

        # Check credentials in DB
        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute("""
                SELECT salt, saltedHashedPassword
                FROM auth
                WHERE username = %s
                """, (user_id,))
            results = cur.fetchall()
        db_conn.commit()

        if len(results) == 0:
            raise falcon.HTTPUnauthorized(description="Authentication failure")

        ((salt, saltedHashedPassword),) = results
        expectSaltedHashedPassword = hashlib.sha256(salt + key).hexdigest()
        if saltedHashedPassword != expectSaltedHashedPassword:
            raise falcon.HTTPUnauthorized(description="Authentication failure")

        # If we get here, the request had HTTP Basic Authentication headers
        # and the credentials therein matched those in the database.
        # So it's an admin sending the request
        req.context["isAdmin"] = True