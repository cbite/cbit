import os
import config.config as cfg
import falcon
import elasticsearch
import json

HIDDEN_SAMPLE_FILTER_LABELS = frozenset((
  'Barcode',
  'Biological Replicate',
  'Sample ID',
  'Sample Name',
  'Source Name',
  'Study ID',
  'Group ID',
  'Protocols',
  'Sample Match',

  # Fields that have been merged in backend
  'Material Name',
  'Material abbreviation',
  'Strain full name',
  'Strain abbreviation',
  'Compound',
  'Compound abbreviation',
))

class MetadataAllCountsResource(object):
    def on_get(self, req, resp):
        """
        Return a JSON response with all metadata property names and
        values (with approx counts).  E.g.,

        {
          "*Compound": {
            "8-br-cAMP - 8-bromo-cAMP": 6,
            "<None>": 123,
            "db-cAMP - dibutyryl-cAMP": 6
          },
          "*Elements composition - % Ca": {
            "1000.0": 12,
            "1225.0": 3,
            "1250.0": 3,
            "1900.0": 12,
            "<None>": 105
          },
          ...
        }
        """

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        if not es.indices.exists('cbit'):
            raise falcon.HTTPInternalServerError(description='ElasticSearch database not ready.  Have you run set_up_dbs.py?')

        sample_mapping = es.indices.get_mapping(index='cbit',
                                                doc_type='sample')
        properties = sample_mapping['cbit']['mappings']['sample']['properties']

        aggs_to_query = {
            propName: {
                "terms": {
                    "field": propName,
                    "missing": "<None>",
                    "size": 10000,  # TODO: Think this through better
                    "order": {"_term": "asc"}
                }
            }

            for propName in properties
            if propName not in HIDDEN_SAMPLE_FILTER_LABELS
        }

        result = es.search(index='cbit', doc_type='sample', body={
            "size": 0,
            "aggs": aggs_to_query
        })

        processed_results = {
            propName: {
                bucketEntry['key']: bucketEntry['doc_count']
                for bucketEntry in propAgg['buckets']
                }
            for propName, propAgg in result['aggregations'].iteritems()
        }

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(processed_results, indent=2, sort_keys=True)