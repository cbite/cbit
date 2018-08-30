import os
import config.config as cfg
import falcon
import elasticsearch
from elasticsearch import helpers
import json
import shutil


class BiomaterialsStudiesResource(object):
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
            query_body = {"match_all": {}}
        else:
            query_body = {"term": {"*Visible": True}}

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

        # Query createdon timestamps
        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            in_placeholder = ', '.join(list(map(lambda x: '%s', studyIds)))
            query = "SELECT uuid, createdon FROM studies "
            if len(studyIds) == 0:
                cur.execute(query)
            else:
                newQuery = (query + "WHERE uuid IN (%s)") % in_placeholder
                cur.execute(newQuery, studyIds)

            results = cur.fetchall()
        db_conn.commit()

        createdon_lookup = {}
        for result in results:
            createdon_lookup[result[0]] = str(result[1])

        # Query study metadata
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
            hit['_createdOn'] = createdon_lookup[hit["_id"]]
            result[hit["_id"]] = hit

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)


class BiomaterialsStudyResource(object):
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
                "_type": cfg.ES_SAMPLE_DOCTYPE,
                "_id": sampleId,
                "_parent": study_uuid
            })
        bulk_items.append({
            "_op_type": "delete",
            "_type": cfg.ES_STUDY_DOCTYPE,
            "_id": study_uuid
        })

        num_docs_added, errors = helpers.bulk(es, index=cfg.ES_INDEX,
                                              refresh='wait_for',
                                              actions=bulk_items)

        study_path = os.path.join(cfg.FILES_PATH, study_uuid)
        shutil.rmtree(study_path)

        # Delete study from DB
        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("DELETE FROM studies WHERE uuid = %s", (study_uuid,))
        db_conn.commit()

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps({
            'studyId': study_uuid
        }, indent=2, sort_keys=True)

    def on_get(self, req, resp, study_uuid):
        """
        Fetches metadata for the requested study by study Id
        DOES NOT TAKE INTO ACCOUNT *Visible FLAG
        => everyone can request every study, even if *Visible=false

        Request data
        ============
          "StudyID123"


        Response
        ========
        { ...study metadata... }
        """

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        mustClauses = [
            {
                "ids": {
                    "values": [study_uuid]
                }
            }
        ]

        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, body={
            "size": 1,
            "query": {
                "bool": {
                    "must": mustClauses
                }
            }
        })

        if len(rawResults["hits"]["hits"]) > 0:
            result = rawResults["hits"]["hits"][0]

            # Query createdon timestamp
            db_conn = req.context["db"]
            with db_conn.cursor() as cur:
                query = "SELECT uuid, createdon FROM studies WHERE uuid = %s"
                cur.execute(query, (study_uuid,))
                results = cur.fetchall()
            db_conn.commit()
            result['_createdOn'] = str(results[0][1])

            resp.status = falcon.HTTP_OK
            resp.body = json.dumps(result, indent=2, sort_keys=True)
        else:
            resp.status = falcon.HTTP_OK
            resp.body = json.dumps(None, indent=2, sort_keys=True)


class BiomaterialsEpicPidStudyResource(object):
    def on_post(self, req, resp):
        """
        Fetches metadata for the requested study by ePIC PID
        DOES NOT TAKE INTO ACCOUNT *Visible FLAG
        => everyone can request every study, even if *Visible=false

        Request data
        ============
          "ePicPid123456"


        Response
        ========
        { ...study metadata... }
        """
        data = json.load(req.stream)
        epic_pid = data['ePicPid']

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, body={
            "size": 1,
            "query": {"term": {"*ePIC PID": epic_pid}}
        })

        if len(rawResults["hits"]["hits"]) > 0:
            result = rawResults["hits"]["hits"][0]
            study_uuid = result['_id']

            # Query createdon timestamp
            db_conn = req.context["db"]
            with db_conn.cursor() as cur:
                query = "SELECT uuid, createdon FROM studies WHERE uuid = %s"
                cur.execute(query, (study_uuid,))
                results = cur.fetchall()
            db_conn.commit()
            result['_createdOn'] = str(results[0][1])

            resp.status = falcon.HTTP_OK
            resp.body = json.dumps(result, indent=2, sort_keys=True)
        else:
            resp.status = falcon.HTTP_OK
            resp.body = json.dumps(None, indent=2, sort_keys=True)
