#! /usr/bin/env gunicorn -c config/gunicorn-config.py -w 4 backend-server:app

import falcon

from biomaterials.resources.dashboard_samples import DashboardSamplesResource
from biomaterials.resources.metadata import BiomaterialsMetadataAllCountsResource, \
    BiomaterialsMetadataFilteredCountsResource, BiomaterialsMetadataSamplesInStudies, BiomaterialsMetadataFields, \
    BiomaterialsMetadataFieldsMulti, BiomaterialsMetadataField, BiomaterialsMetadataSearch, \
    BiomaterialsMetadataStudiesResource
from biomaterials.resources.samples import BiomaterialsSamplesResource
from biomaterials.resources.studies import BiomaterialsStudyResource, BiomaterialsStudiesResource
from common.resources.user import UsersResource, UserResource
from config import config as cfg
from middleware.clean_old_uploads import (
    CleanOldUploadsMiddleware,
    CleanOldDownloadsMiddleware
)
from middleware.cors import CORSMiddleware
from middleware.database_session import DatabaseSessionMiddleware
from middleware.authentication import AuthenticationMiddleware

from biomaterials.resources.uploads import (
    BiomaterialsUploadResource,
    BiomaterialsUploadsResource,
    BiomaterialsUploadsIRODSResource,
)

from biomaterials.resources.study_archive import BiomaterialsStudyArchiveResource
from biomaterials.resources.study_protocols import BiomaterialsStudyProtocolsResource

from common.resources.irods import IRODSListResource
from tendons.resources.studies import TendonsStudyResource, TendonsStudiesResource

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

# BIOMATERIALS ROUTES
app.add_route('/biomaterials/uploads', BiomaterialsUploadsResource())
app.add_route('/biomaterials/uploads/_irods/{folder_name}', BiomaterialsUploadsIRODSResource())
app.add_route('/biomaterials/uploads/{upload_uuid}', BiomaterialsUploadResource())

app.add_route('/biomaterials/samples', BiomaterialsSamplesResource())

app.add_route('/biomaterials/studies', BiomaterialsStudiesResource())
app.add_route('/biomaterials/studies/{study_uuid}', BiomaterialsStudyResource())
app.add_route('/biomaterials/studies/{study_uuid}/archive', BiomaterialsStudyArchiveResource())
app.add_route('/biomaterials/studies/{study_uuid}/protocols', BiomaterialsStudyProtocolsResource())

app.add_route('/biomaterials/metadata/all_counts', BiomaterialsMetadataAllCountsResource())
app.add_route('/biomaterials/metadata/filtered_counts', BiomaterialsMetadataFilteredCountsResource())
app.add_route('/biomaterials/metadata/studies', BiomaterialsMetadataStudiesResource())
app.add_route('/biomaterials/metadata/samples_in_studies', BiomaterialsMetadataSamplesInStudies())
app.add_route('/biomaterials/metadata/search', BiomaterialsMetadataSearch())
app.add_route('/biomaterials/metadata/fields', BiomaterialsMetadataFields())
app.add_route('/biomaterials/metadata/fields/_multi', BiomaterialsMetadataFieldsMulti())
app.add_route('/biomaterials/metadata/fields/{field_name}', BiomaterialsMetadataField())

# TENDONS ROUTES
app.add_route('/tendons/studies', TendonsStudiesResource())
app.add_route('/tendons/studies/{study_uuid}', TendonsStudyResource())


# GENERAL ROUTES
app.add_route('/dashboard/samples', DashboardSamplesResource())
app.add_route('/irods/list', IRODSListResource())
app.add_route('/users', UsersResource())
app.add_route('/users/{username}', UserResource())