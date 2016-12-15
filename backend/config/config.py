# NOTE: This file is only used in development!  See ansible deployment scripts for production

DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "cbit"
DB_PASS = "2076a675b6d813b582977189c13a3279cc9cf02a9aeab01389798d9167cf259c8b247aee9a2be149"
DB_NAME = "cbit"

FILE_ENCODING = "cp1252"  # All files are coming from Windows and ISAcreator uses this encoding for output (!)

# Delete temporary uploads and downloads after this much time.
# This interval only applies to stale partial uploads/downloads.  In the common case:
# - completed uploads are deleted as soon as ingested into the database,
# - completed downloads are deleted immediately after download

# NOTE: Should be compatible with Postgres INTERVAL syntax:
# https://www.postgresql.org/docs/9.5/static/functions-datetime.html
UPLOAD_STALE_INTERVAL = '24 hour'
DOWNLOAD_STALE_INTERVAL = '24 hour'

ES_HOST = "localhost"
ES_PORT = 9200
ES_INDEX = 'cbit'
ES_STUDY_DOCTYPE = 'study'
ES_SAMPLE_DOCTYPE = 'sample'

CORS_ENABLED = True                  # TODO: Disabled in production, where nginx proxies a URL tree in the same domain instead
URL_BASE = 'http://localhost:23456'  # TODO: In production, should be https://cbit.maastrichtuniversity.nl/api

UPLOADS_PATH = 'uploads'
DOWNLOADS_PATH = 'downloads'
FILES_PATH = 'files'

IRODS_BASE_URL = "http://frontend.acc.rit.unimaas.nl/rest/"
IRODS_BASE_DIR = "/nlmumc/projects/P000000003"
# IRODS_USERNAME = "dataminded-service@maastrichtuniversity.nl";
IRODS_USERNAME = "service-dataminded"
IRODS_PASSWORD = "mrln2016?"
