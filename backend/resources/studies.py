import os
import config.config as cfg
import falcon
import elasticsearch
import json

class StudiesResource(object):
    def on_post(self, req, resp):
        """
        Fetches metadata for multiple studies in one request

        Request data
        ============
        [
          "StudyID123",
          "StudyID456",
          ...
        ]

        Response
        ========
        {
          "StudyID123": { ...study metadata... },
          "StudyID456": { ...study metadata... },
          ...
        }
        """

        studyIds = json.load(req.stream)

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        rawResults = es.search(index='cbit', doc_type='study', body={
            "size": len(studyIds),
            "query": {
                "ids": {
                    "values": studyIds
                }
            }
        })

        result = {}
        for hit in rawResults["hits"]["hits"]:
            result[hit["_id"]] = hit

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)