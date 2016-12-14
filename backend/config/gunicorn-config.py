# NOTE: This file is only used in development!  See ansible deployment scripts for production

import multiprocessing

bind = [
    "127.0.0.1:23456",
    #"0.0.0.0:23456"   # TODO: Uncomment in production
]
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = 'sync'  # WARNING: if you change to gevent, patch psycopg2 to be gevent-safe: https://bitbucket.org/dvarrazzo/psycogreen/
pidfile = 'pidfile.txt'
reload = True    # TODO: Set to false in production!
#daemon = True   # TODO: Uncomment in production
#user = 'cbitbackend'  # TODO: Make user in production, then uncomment this
#group = 'cbitbackend'  # TODO: Make group in production, then uncomment this

accesslog = 'access.log'  # TODO: Place somewhere more useful in production
errorlog = 'error.log'    # TODO: Place somewhere more useful in production

# TODO: When planning out deployment, go over this page: http://docs.gunicorn.org/en/stable/deploy.html