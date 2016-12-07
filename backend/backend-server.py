#! /usr/bin/env gunicorn -c config/gunicorn-config.py -w 4 backend-server:app

import falcon
from middleware.clean_old_uploads import CleanOldUploadsMiddleware
from middleware.cors import CORSMiddleware
from middleware.database_session import DatabaseSessionMiddleware
from resources.uploads import UploadResource, UploadsResource
from resources.samples import SamplesResource
from resources.studies import StudiesResource, StudyResource
from resources.study_archive import StudyArchiveResource
from resources.metadata import (
    MetadataAllCountsResource,
    MetadataFilteredCountsResource,
    MetadataSamplesInStudies,
    MetadataSearch,
    MetadataFields,
    MetadataFieldsMulti,
    MetadataField
)



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



app = falcon.API(middleware=[
    CORSMiddleware(),
    DatabaseSessionMiddleware(),
    CleanOldUploadsMiddleware()
])

app.add_route('/uploads', UploadsResource())
app.add_route('/uploads/{upload_uuid}', UploadResource())

app.add_route('/samples', SamplesResource())

app.add_route('/studies', StudiesResource())
app.add_route('/studies/{study_uuid}', StudyResource())
app.add_route('/studies/{study_uuid}/archive', StudyArchiveResource())

app.add_route('/metadata/all_counts', MetadataAllCountsResource())
app.add_route('/metadata/filtered_counts', MetadataFilteredCountsResource())
app.add_route('/metadata/samples_in_studies', MetadataSamplesInStudies())
app.add_route('/metadata/search', MetadataSearch())
app.add_route('/metadata/fields', MetadataFields())
app.add_route('/metadata/fields/_multi', MetadataFieldsMulti())
app.add_route('/metadata/fields/{field_name}', MetadataField())