import os
import config.config as cfg
import falcon
import elasticsearch
from elasticsearch import helpers
import json
import shutil

class StudiesResource(object):
    def on_get(self, req, resp):
        """
        Get a list of all study IDs.

        Request data
        ============
        None

        Response
        ========
        [
          "StudyID123",
          "StudyID456",
          ...
        ]
        """

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        if req.context["isAdmin"]:
            query_body = { "match_all": {} }
        else:
            query_body = { "term": { "*Visible": True } }

        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, _source=None, body={
            "size": 10000,  # TODO: Think about large sizes
            "query": query_body
        })

        result = []
        for hit in rawResults["hits"]["hits"]:
            result.append(hit["_id"])

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)


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

        mustClauses = [
            {
                "ids": {
                    "values": studyIds
                }
            }
        ]

        if not req.context["isAdmin"]:
            mustClauses.append({
                "term": {
                    "*Visible": True
                }
            })

        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, body={
            "size": len(studyIds),
            "query": {
                "bool": {
                    "must": mustClauses
                }
            }
        })

        result = {}
        for hit in rawResults["hits"]["hits"]:
            result[hit["_id"]] = hit

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)


class StudyResource(object):
    def on_delete(self, req, resp, study_uuid):
        """
        Status of 403 (Forbidden) if the request is not made as an admin
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        # Check that study exists
        if not es.exists(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, id=study_uuid):
            raise falcon.HTTPNotFound(description='Study {0} does not exist'.format(study_uuid))

        # Get all sample IDs for the given study ID
        rawResults = es.search(
            index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE, _source=["_id"], body={
                "size": 10000,  # TODO: Think this through
                "query": {
                    "has_parent": {
                        "parent_type": cfg.ES_STUDY_DOCTYPE,
                        "query": {
                            "ids": {
                                "values": [study_uuid]
                            }
                        }
                    }
                }
            }
        )

        sampleIds = []
        for hit in rawResults["hits"]["hits"]:
            sampleIds.append(hit["_id"])


        # Now do a bulk operation to delete the samples, then the study
        bulk_items = []
        for sampleId in sampleIds:
            bulk_items.append({
                "_op_type": "delete",
                "_type":    cfg.ES_SAMPLE_DOCTYPE,
                "_id":      sampleId,
                "_parent":  study_uuid
            })
        bulk_items.append({
            "_op_type": "delete",
            "_type":    cfg.ES_STUDY_DOCTYPE,
            "_id":      study_uuid
        })

        num_docs_added, errors = helpers.bulk(es, index=cfg.ES_INDEX,
                                              refresh='wait_for',
                                              actions=bulk_items)

        study_path = os.path.join(cfg.FILES_PATH, study_uuid)
        shutil.rmtree(study_path)

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps({
            'studyId': study_uuid
        }, indent=2, sort_keys=True)
