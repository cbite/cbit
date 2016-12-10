import json
import falcon

class UserResource(object):
    def on_get(self, req, resp, username):
        """
        GET info about a user.
        Used to test authentication and obtain real name during login.

        Response data
        =============
        {
          "realname": "Dr. Who"
        }

        Errors
        ======
        403 Forbidden - Credentials aren't those of an admin
        404 Not Found - User doesn't exist
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("SELECT realname FROM auth WHERE username = %s", (username,))
            results = cur.fetchall()
        db_conn.commit()

        if len(results) == 0:
            raise falcon.HTTPNotFound(description="User {0} doesn't exist".format(username))

        ((realname,),) = results

        resp_json = {
            "realname": realname
        }
        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)