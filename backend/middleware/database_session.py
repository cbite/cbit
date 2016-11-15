import psycopg2

import config.config as cfg


class DatabaseSessionMiddleware(object):
    """
    Initiates a new DB connection for incoming request and closes it in the end.
    """

    def process_request(self, req, resp):
        req.context['db'] = psycopg2.connect(
            host=cfg.DB_HOST,
            port=cfg.DB_PORT,
            user=cfg.DB_USER,
            password=cfg.DB_PASS,
            database=cfg.DB_NAME
        )


    def process_response(self, req, resp, resource):
        if 'db' in req.context:
            req.context['db'].close()
