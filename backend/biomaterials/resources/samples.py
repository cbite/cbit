import config.config as cfg
import falcon
import elasticsearch
import json

from biomaterials.resources.metadata import fetchInvisibleStudyIds


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

        invisibleStudyIds = fetchInvisibleStudyIds(es, req.context["isAdmin"])

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