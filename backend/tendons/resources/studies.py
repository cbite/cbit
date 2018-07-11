import uuid
import falcon
import json

from common.data.study_type import StudyType, GeneExpressionType, determineTendonsStudyType


class TendonsStudiesResource(object):
    def on_get(self, req, resp):
        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("SELECT * FROM tendons_metadata")
            results = cur.fetchall()
        db_conn.commit()

        resp_json = [
            {
                "uuid": uuid,
                "name": name,
                "arrayExpressId": arrayExpressId,
                "pubMedId": pubMedId,
                "description": description,
                "geneExpressionType": geneExpressionType,
                "platform": platform,
                "organism": organism,
                "cellOrigin": cellOrigin,
                "year": int(year),
                "sampleSize": int(sampleSize),
                "visible": visible
            }
            for (
                uuid, name, arrayExpressId, pubMedId, description, geneExpressionType, platform, organism, cellOrigin,
                year,
                sampleSize, visible) in results
        ]

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)

    def on_post(self, req, resp):
        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        # Create new uuid
        study_uuid = '{study_uuid}'.format(study_uuid=uuid.uuid4())

        # Check if there is no existing study with this id
        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("SELECT * FROM tendons_metadata WHERE uuid = %s", (study_uuid,))
            results = cur.fetchall()
        db_conn.commit()

        if len(results) > 1:
            raise falcon.HTTPInternalServerError(description="UUID conflict, try again")

        study = json.load(req.stream)

        # Check if the study has a valid type
        study_type = determineTendonsStudyType(study['geneExpressionType'])
        if study_type not in [StudyType.tendons_rna_seq, StudyType.tendons_microarray]:
            raise ValueError(
                'Incorrect value specified for Gene expression type: {0}. Should be {1} or {2}'
                    .format(study['geneExpressionType'], GeneExpressionType.microarray, GeneExpressionType.rna_seq))

        # Insert the study and its metadata in the database
        try:
            db_conn = req.context['db']
            with db_conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO studies (uuid, name, type)
                    VALUES (%s, %s, %s)
                    """,
                    [
                        study_uuid,
                        study['name'],
                        study_type
                    ]
                )
                cur.execute(
                    """
                    INSERT INTO tendons_metadata (uuid, name, arrayExpressId, pubMedId, description, geneExpressionType, platform, organism, cellOrigin, year, sampleSize, visible)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [
                        study_uuid,
                        study['name'],
                        study['arrayExpressId'],
                        study['pubMedId'],
                        study['description'],
                        study['geneExpressionType'],
                        study['platform'],
                        study['organism'],
                        study['cellOrigin'],
                        study['year'],
                        study['sampleSize'],
                        bool(study['visible'])
                    ]
                )
            db_conn.commit()
        except Exception as e:
            raise falcon.HTTPBadRequest(description="{0}".format(str(e)))

        resp.status = falcon.HTTP_CREATED
        resp_json = {
            'study_uuid': study_uuid,
        }
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)


class TendonsStudyResource(object):
    def on_get(self, req, resp, study_uuid):
        try:
            db_conn = req.context["db"]
            with db_conn.cursor() as cur:
                cur.execute("SELECT * FROM tendons_metadata WHERE uuid = %s", (study_uuid,))
                results = cur.fetchall()
            db_conn.commit()

            if len(results) == 0:
                raise falcon.HTTPNotFound(description="Tendon study with id {0} doesn't exist".format(study_uuid))

            ((uuid, name, arrayExpressId, pubMedId, description, geneExpressionType, platform, organism, cellOrigin,
              year, sampleSize, visible),) = results

            resp_json = {
                "uuid": uuid,
                "name": name,
                "arrayExpressId": arrayExpressId,
                "pubMedId": pubMedId,
                "description": description,
                "geneExpressionType": geneExpressionType,
                "platform": platform,
                "organism": organism,
                "cellOrigin": cellOrigin,
                "year": int(year),
                "sampleSize": int(sampleSize),
                "visible": visible
            }

            resp.status = falcon.HTTP_OK
            resp.body = json.dumps(resp_json, indent=2, sort_keys=True)

        except Exception as e:
            raise falcon.HTTPBadRequest(description="{0}".format(str(e)))

    def on_put(self, req, resp, study_uuid):
        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(
                description="Only admins can perform this action")

        try:
            # Check if the study exists
            db_conn = req.context["db"]
            with db_conn.cursor() as cur:
                cur.execute("SELECT * FROM tendons_metadata WHERE uuid = %s", (study_uuid,))
                results = cur.fetchall()
            db_conn.commit()

            if len(results) == 0:
                raise falcon.HTTPNotFound(description="Tendon study with id {0} doesn't exist".format(study_uuid))

            study = json.load(req.stream)

            # Check if the study has a valid type
            study_type = determineTendonsStudyType(study['geneExpressionType'])
            if study_type not in [StudyType.tendons_rna_seq, StudyType.tendons_microarray]:
                raise ValueError(
                    'Incorrect value specified for Gene expression type: {0}. Should be {1} or {2}'
                        .format(study['geneExpressionType'], GeneExpressionType.microarray, GeneExpressionType.rna_seq))

            # Update the study metadata in the database
            db_conn = req.context['db']
            with db_conn.cursor() as cur:
                cur.execute("UPDATE studies " +
                            "SET name = %s " +
                            ", type = %s " +
                            "WHERE uuid = %s",
                            (study['name'], study_type, study_uuid))

                cur.execute("UPDATE tendons_metadata " +
                            "SET name = %s " +
                            ", arrayExpressId = %s " +
                            ", pubMedId = %s " +
                            ", description = %s " +
                            ", geneExpressionType = %s " +
                            ", platform = %s " +
                            ", organism = %s " +
                            ", cellOrigin = %s " +
                            ", year = %s " +
                            ", sampleSize = %s " +
                            ", visible = %s " +
                            "WHERE uuid = %s",
                            (study['name'],
                             study['arrayExpressId'],
                             study['pubMedId'],
                             study['description'],
                             study['geneExpressionType'],
                             study['platform'],
                             study['organism'],
                             study['cellOrigin'],
                             study['year'],
                             study['sampleSize'],
                             bool(study['visible']),
                             study_uuid))

            db_conn.commit()
        except Exception as e:
            raise falcon.HTTPBadRequest(description="{0}".format(str(e)))

        resp.status = falcon.HTTP_OK
        resp_json = {
            'study_uuid': study_uuid,
        }
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)

    def on_delete(self, req, resp, study_uuid):
        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(description="Only admins can perform this action")

        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("SELECT * FROM tendons_metadata WHERE uuid = %s", (study_uuid,))
            results = cur.fetchall()
        db_conn.commit()

        if len(results) == 0:
            raise falcon.HTTPNotFound(description="Tendon study with id {0} doesn't exist".format(study_uuid))

        with db_conn.cursor() as cur:
            cur.execute("DELETE FROM tendons_metadata WHERE uuid = %s", (study_uuid,))
            cur.execute("DELETE FROM studies WHERE uuid = %s", (study_uuid,))
        db_conn.commit()

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps({"acknowledged": True}, indent=2, sort_keys=True)
