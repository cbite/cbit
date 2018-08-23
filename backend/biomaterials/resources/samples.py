from itertools import groupby
from operator import attrgetter
from sets import Set

import config.config as cfg
import falcon
import elasticsearch
import json

from biomaterials.resources.metadata import fetchInvisibleBiomaterialStudyIds


class BiomaterialsSamplesResource(object):
    def on_post(self, req, resp):
        """
        Fetches metadata for multiple samples in one request

        Request data
        ============
        [
          "SampleID123",
          "SampleID456",
          ...
        ]

        Response
        ========
        {
          "SampleID123": { ...sample metadata... },
          "SampleID456": { ...sample metadata... },
          ...
        }
        """

        sampleIds = json.load(req.stream)

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        invisibleStudyIds = fetchInvisibleBiomaterialStudyIds(es, req.context["isAdmin"])

        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE, body={
            "size": len(sampleIds),
            "query": {
                "bool": {
                    "must": {
                        "ids": {
                            "values": sampleIds
                        }
                    },
                    "must_not": {
                        "has_parent": {
                            "type": cfg.ES_STUDY_DOCTYPE,
                            "query": {
                                "ids": {
                                    "type": cfg.ES_STUDY_DOCTYPE,
                                    "values": invisibleStudyIds
                                }
                            }
                        }
                    }
                }
            }
        })

        result = {}
        for hit in rawResults["hits"]["hits"]:
            result[hit["_id"]] = hit

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)

    def on_get(self, req, resp):
        """
        Fetches metadata for multiple samples in one request

        Request data
        ============
        [
          "SampleID123",
          "SampleID456",
          ...
        ]

        Response
        ========
        {
          "SampleID123": { ...sample metadata... },
          "SampleID456": { ...sample metadata... },
          ...
        }
        """

        # sampleIds = json.load(req.stream)

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        invisibleStudyIds = fetchInvisibleBiomaterialStudyIds(es, req.context["isAdmin"])

        rawSampleResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE, body={
            "size": 100000,
            "query": {
                "bool": {
                    "must": {
                        #
                    },
                    "must_not": {
                        "has_parent": {
                            "type": cfg.ES_STUDY_DOCTYPE,
                            "query": {
                                "ids": {
                                    "type": cfg.ES_STUDY_DOCTYPE,
                                    "values": invisibleStudyIds
                                }
                            }
                        }
                    }
                }
            }
        })

        study_ids = Set([])
        sample_lookup = {}
        material_data = {}
        for item in rawSampleResults["hits"]["hits"]:
            key = item['_source']['Material Class']
            study_id = item['_parent']
            sample_id = item['_id']
            sample_name = item['_source']['Sample Name']
            sample_lookup[sample_id]=sample_name
            study_ids.add(study_id)

            if key not in material_data:
                material_data[key] = []
            material_data[key].append({'sampleId': sample_id, 'studyId': study_id})

        rawStudyResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, body={
            "size": len(list(study_ids)),
            "query": {
                "bool": {
                    "must": [
                                {
                                    "ids": {
                                        "values": list(study_ids)
                                    }
                                }
                            ]
                }
            }
        })

        study_lookup = {}
        for hit in rawStudyResults["hits"]["hits"]:
            study_lookup[hit["_id"]] = hit['_source']['STUDY']['Study Title']

        result = {}
        result['materialData'] = material_data
        result['studyLookup'] = study_lookup
        result['sampleLookup'] = sample_lookup

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)
