DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "cbit"
DB_PASS = "2076a675b6d813b582977189c13a3279cc9cf02a9aeab01389798d9167cf259c8b247aee9a2be149"
DB_NAME = "cbit"

FILE_ENCODING = "cp1252"  # All files are coming from Windows and ISAcreator uses this encoding for output (!)

# Delete temporary uploads after this much time
# (completed uploads are deleted as soon as ingested into the database,
# this interval only applies to stale partial uploads)

# NOTE: Should be compatible with Postgres INTERVAL syntax:
# https://www.postgresql.org/docs/9.5/static/functions-datetime.html
UPLOAD_STALE_INTERVAL = '24 hour'

ES_HOST = "localhost"
ES_PORT = 9200

FQDN = 'localhost:23456'  # TODO: In production, should be cbit.maastrichtuniversity.nl
URL_BASE = 'http://{0}'.format(FQDN)

UPLOADS_PATH = 'uploads'
FILES_PATH = 'files'