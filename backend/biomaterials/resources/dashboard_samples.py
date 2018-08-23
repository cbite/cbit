from sets import Set

import config.config as cfg
import falcon
import elasticsearch
import json

from biomaterials.resources.metadata import fetchInvisibleStudyIds


class DashboardSamplesResource(object):

    def on_get(self, req, resp):
        """
        Fetches the dashboard data

        """

        # sampleIds = json.load(req.stream)

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        invisibleStudyIds = fetchInvisibleStudyIds(es, req.context["isAdmin"])

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
        sample_list = {}
        for item in rawSampleResults["hits"]["hits"]:
            sample_id = item['_id']
            study_id = item['_parent']
            sample_name = item['_source']['Sample Name']
            material_class = item['_source']['Material Class']
            material_name = item['_source']['Material Name']
            cell_strain_abbreviation = item['_source']['Cell strain abbreviation']
            organism = item['_source']['Organism']

            sample_lookup[sample_id] = sample_name
            study_ids.add(study_id)

            sample_list[sample_id]={'sampleId': sample_id, 'studyId': study_id, 'materialClass': material_class,
                                           'materialName': material_name, 'organism': organism,
                                           'cellStrainAbbreviation': cell_strain_abbreviation}

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

        result = {'samplesData': sample_list, 'studyLookup': study_lookup, 'sampleLookup': sample_lookup}
        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)
