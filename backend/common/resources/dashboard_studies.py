import config.config as cfg
import falcon
import elasticsearch
import json

from datetime import datetime
from biomaterials.resources.metadata import fetchInvisibleBiomaterialStudyIds
from common.data.study_type import determineType, determineGeneExpressionType


class DashboardStudiesResource(object):

    def on_get(self, req, resp):
        """
        Fetches the dashboard studies data

        """

        try:
            db_conn = req.context["db"]

            es = elasticsearch.Elasticsearch(
                hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

            invisibleBiomaterialStudyIds = fetchInvisibleBiomaterialStudyIds(es, req.context["isAdmin"])
            invisibleTendonsStudyIds = fetchInvisibleTendonsStudyIds(db_conn, req.context["isAdmin"])
            invisibleStudyIds = invisibleBiomaterialStudyIds + invisibleTendonsStudyIds
            in_placeholder = ', '.join(list(map(lambda x: '%s', invisibleStudyIds)))

            # Query overall study information
            with db_conn.cursor() as cur:
                query = "SELECT uuid, name, type FROM studies "
                if len(invisibleStudyIds) == 0:
                    cur.execute(query)
                else:
                    newQuery = (query + "WHERE uuid NOT IN (%s)") % in_placeholder
                    cur.execute(newQuery, invisibleStudyIds)

                study_results = cur.fetchall()
            db_conn.commit()

            # Query tendon study years
            with db_conn.cursor() as cur:
                query = "SELECT uuid, year FROM tendons_metadata "
                if len(invisibleStudyIds) == 0:
                    cur.execute(query)
                else:
                    newQuery = (query + "WHERE uuid NOT IN (%s)") % in_placeholder
                    cur.execute(newQuery, invisibleStudyIds)

                tendons_results = cur.fetchall()
            db_conn.commit()

            year_lookup = {}
            for tendons_result in tendons_results:
                year_lookup[tendons_result[0]] = str(tendons_result[1])

            # Query biomaterial study years
            if req.context["isAdmin"]:
                query_body = {"match_all": {}}
            else:
                query_body = {"term": {"*Visible": True}}

            rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, _source=None, body={
                "size": 10000,  # TODO: Think about large sizes
                "query": query_body
            })

            for hit in rawResults["hits"]["hits"]:
                year_lookup[hit["_id"]] = str(datetime.strptime(hit['_source']['STUDY']['Study Public Release Date'],
                                                            '%Y-%m-%d').year)

            # Combine all information
            resp_json = [
                {
                    "uuid": uuid,
                    "name": name,
                    "type": determineType(study_type),
                    "geneExpressionType": determineGeneExpressionType(study_type),
                    "year": year_lookup[uuid]
                }
                for (uuid, name, study_type) in study_results
            ]

            resp.status = falcon.HTTP_OK
            resp.body = json.dumps(resp_json, indent=2, sort_keys=True)

        except Exception as e:
            raise falcon.HTTPBadRequest(description="{0}".format(str(e)))


def fetchInvisibleTendonsStudyIds(db_conn, isAdmin):  # Don't include hidden studies unless logged in as admin
    if isAdmin:
        return []
    else:
        with db_conn.cursor() as cur:
            query = "SELECT uuid FROM tendons_metadata WHERE visible = %s"
            cur.execute(query, (False,))
            results = cur.fetchall()
        db_conn.commit()

        return [
            uuid
            for (uuid,) in results
        ]
