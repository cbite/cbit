import json
import falcon
import bcrypt
import hashlib

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

    def on_post(self, req, resp, username):
        """
        Change info about a user.  For now, just the password.

        Request data
        ============
        {
          "newPassword": "..."
        }

        Response data
        =============
        {
          "acknowledged": true
        }

        Errors
        ======
        400 Bad Request - Badly formed payload or empty password
        403 Forbidden - Credentials aren't those of an admin
        404 Not Found - User doesn't exist
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        newInfo = json.load(req.stream)
        newPassword = newInfo.get("newPassword")
        if not newPassword:
            raise falcon.HTTPBadRequest(description="Must specify newPassword")

        db_conn = req.context["db"]

        with db_conn.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM auth WHERE username = %s", (username,))
            (count,) = cur.fetchone()

        if count == 0:
            raise falcon.HTTPNotFound(description="User {0} doesn't exist".format(username))

        # Randomly salt password
        salt = bcrypt.gensalt()
        saltedAndHashedPassword = hashlib.sha256(salt + newPassword).hexdigest()
        with db_conn.cursor() as cur:
            cur.execute("""
                UPDATE auth
                SET
                    salt = %s,
                    saltedHashedPassword = %s
                WHERE username = %s
                """, (salt, saltedAndHashedPassword, username,))

        db_conn.commit()

        resp_json = {
            "acknowledged": True
        }
        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)


    def on_delete(self, req, resp, username):
        """
        Delete the given user

        Request data
        ============
        <None>

        Response data
        =============
        {
          "acknowledged": true
        }

        Status codes:
        200 OK - all good
        403 Forbidden - only admins can do this
        404 Not Found - No such user
        409 Conflict - if you try to delete the only admin that exists
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("SELECT COUNT(*), SUM(CASE WHEN username=%s THEN 1 ELSE 0 END) FROM auth", (username,))
            (countAll, countMe,) = cur.fetchone()

        if countMe == 0:
            raise falcon.HTTPConflict(description="User {0} does not exist".format(username))
        if countAll == 0:
            raise falcon.HTTPConflict(description="Cannot delete last remaining admin user")

        with db_conn.cursor() as cur:
            cur.execute("DELETE FROM auth WHERE username = %s", (username,))

        db_conn.commit()

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps({ "acknowledged": True }, indent=2, sort_keys=True)


class UsersResource(object):
    def on_get(self, req, resp):
        """
        Get usernames and realnames of all users

        Response data
        =============
        [
          {
            "username": "user1",
            "realname": "TheFirstUser"
          },
          {
            "username": "user2",
            "realname": "TheSecondUser"
          },
          ...
        ]

        Status codes
        ============
        403 Forbidden - If not logged in as an admin
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("""
                SELECT username, realname
                FROM auth
            """)
            results = cur.fetchall()
        db_conn.commit()

        resp_json = [
            {
                "username": username,
                "realname": realname
            }
            for (username, realname) in results
        ]

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)


    def on_post(self, req, resp):
        """
        Change user metadata in bulk

        Request data
        ============
        [
          {
            "username": "user1",
            "realname": "New Real Name"
          },
          {
            "username": "user2",
            "realname": "Even newer Real Name"
          },
          ...
        }

        Response data
        =============
        {
          "acknowledged": true
        }

        Status codes
        ============
        200 OK - all good
        403 Forbidden - Not an admin
        404 Not found - At least one of the usernames is invalid
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        # 0. Extract & check request data
        data = json.load(req.stream)
        if not isinstance(data, list):
            raise falcon.HTTPBadRequest(description="Expected JSON list as payload")
        for userdata in data:
            if "username" not in userdata:
                raise falcon.HTTPBadRequest(description="Missing username")
            username = userdata["username"]
            if not username:
                raise falcon.HTTPBadRequest(description="Blank username is invalid")
            if "realname" not in userdata:
                raise falcon.HTTPBadRequest(description="Missing 'realname' for user {0}".format(username))

        # 1. Check for unknown usernames
        usernames = [userdata["username"] for userdata in data]
        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("SELECT username FROM auth WHERE username IN %s", (tuple(usernames),))
            results = cur.fetchall()

        existingUsernames = set([username for (username,) in results])
        missingUsernames = set(usernames).difference(existingUsernames)
        if missingUsernames:
            raise falcon.HTTPNotFound(description="Usernames {0} don't exist".format(list(missingUsernames)))

        # 2. Effect change
        query = """
            UPDATE auth
            SET
              realname = %s
            WHERE username = %s
        """
        params = [(userdata["realname"], userdata["username"]) for userdata in data]
        with db_conn.cursor() as cur:
            cur.executemany(query, params)

        db_conn.commit()

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps({"acknowledged": True}, indent=2, sort_keys=True)
