from sets import Set

import config.config as cfg
import falcon
import elasticsearch
import json

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

            query = "SELECT uuid, name, type FROM studies "

            in_placeholder = ', '.join(list(map(lambda x: '%s', invisibleStudyIds)))
            with db_conn.cursor() as cur:
                if len(invisibleStudyIds)==0:
                    cur.execute(query)
                else:
                    newQuery = (query + "WHERE uuid NOT IN (%s)") % in_placeholder
                    cur.execute(newQuery, invisibleStudyIds)

                results = cur.fetchall()
            db_conn.commit()

            resp_json = [
                {
                    "uuid": uuid,
                    "name": name,
                    "type": determineType(study_type),
                    "geneExpressionType": determineGeneExpressionType(study_type),
                }
                for (uuid, name, study_type) in results
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
