import os
import config.config as cfg
import falcon
import elasticsearch
import json

class SamplesResource(object):
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

        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE, body={
            "size": len(sampleIds),
            "query": {
                "ids": {
                    "values": sampleIds
                }
            }
        })

        result = {}
        for hit in rawResults["hits"]["hits"]:
            result[hit["_id"]] = hit

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)