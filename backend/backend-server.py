#! /usr/bin/env gunicorn -c config/gunicorn-config.py -w 4 backend-server:app

import falcon
from config import config as cfg
from middleware.clean_old_uploads import (
    CleanOldUploadsMiddleware,
    CleanOldDownloadsMiddleware
)
from middleware.cors import CORSMiddleware
from middleware.database_session import DatabaseSessionMiddleware
from middleware.authentication import AuthenticationMiddleware
from resources.uploads import (
    UploadResource,
    UploadsResource,
    UploadsIRODSResource,
)
from resources.downloads import (
    DownloadsResource,
    DownloadResource,
    DownloadProgressResource,
)
from resources.samples import SamplesResource
from resources.studies import StudiesResource, StudyResource
from resources.study_archive import StudyArchiveResource
from resources.study_protocols import StudyProtocolsResource
from resources.metadata import (
    MetadataAllCountsResource,
    MetadataFilteredCountsResource,
    MetadataStudiesResource,
    MetadataSamplesInStudies,
    MetadataSearch,
    MetadataFields,
    MetadataFieldsMulti,
    MetadataField
)
from resources.user import UserResource, UsersResource
from resources.irods import IRODSListResource


ES_TRACE_LOGGING = False
if ES_TRACE_LOGGING:
    import logging
    es_tracer = logging.getLogger('elasticsearch.trace')
    es_tracer.propagate = False
    es_tracer.setLevel(logging.DEBUG)
    es_tracer_handler=logging.handlers.RotatingFileHandler('es-trace.log',
                                                       maxBytes=0.5*10**9,
                                                       backupCount=3)
    es_tracer.addHandler(es_tracer_handler)



middleware = []
if cfg.CORS_ENABLED:
    middleware.append(CORSMiddleware())
middleware.extend([
    DatabaseSessionMiddleware(),
    CleanOldUploadsMiddleware(),
    CleanOldDownloadsMiddleware(),
    AuthenticationMiddleware()
])

app = falcon.API(middleware=middleware)

app.add_route('/uploads', UploadsResource())
app.add_route('/uploads/_irods/{folder_name}', UploadsIRODSResource())
app.add_route('/uploads/{upload_uuid}', UploadResource())

app.add_route('/downloads', DownloadsResource())
app.add_route('/downloads/{download_uuid}', DownloadResource())
app.add_route('/downloads/{download_uuid}/_progress', DownloadProgressResource())

app.add_route('/samples', SamplesResource())

app.add_route('/studies', StudiesResource())
app.add_route('/studies/{study_uuid}', StudyResource())
app.add_route('/studies/{study_uuid}/archive', StudyArchiveResource())
app.add_route('/studies/{study_uuid}/protocols', StudyProtocolsResource())

app.add_route('/metadata/all_counts', MetadataAllCountsResource())
app.add_route('/metadata/filtered_counts', MetadataFilteredCountsResource())
app.add_route('/metadata/studies', MetadataStudiesResource())
app.add_route('/metadata/samples_in_studies', MetadataSamplesInStudies())
app.add_route('/metadata/search', MetadataSearch())
app.add_route('/metadata/fields', MetadataFields())
app.add_route('/metadata/fields/_multi', MetadataFieldsMulti())
app.add_route('/metadata/fields/{field_name}', MetadataField())

app.add_route('/users', UsersResource())
app.add_route('/users/{username}', UserResource())

app.add_route('/irods/list', IRODSListResource())