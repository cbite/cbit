import json
import falcon
import config.config as cfg
import elasticsearch
import uuid
import os
from collections import defaultdict
import subprocess
import shutil
from data.fieldmeta import FieldMeta

class DownloadsResource(object):
    def on_post(self, req, resp):
        """
        Start creating a download bundle with the given studies and samples.
        You can query the progress of the bundle creation by GETting /downloads/{download_uuid}/status,
        and then GET the complete bundle at /downloads/{download_uuid}.

        Request Data
        ============
        {
          "onlyIncludeMetadata": false,
          "sampleIds": [
            "SampleId1",
            "SampleId2",
            ...
          ]
        }

        Response Data
        =============
        {
          "download_uuid": "<UUID>"
        }
        """

        # TODO: Investigate using `celery` or something like it to manage
        # this long-running job, instead of rolling my own quickly here...

        data = json.load(req.stream)

        # 0. Check request data
        # ---------------------

        if not isinstance(data, dict):
            raise falcon.HTTPBadRequest(
                description="Expected JSON object as payload")

        onlyIncludeMetadata = data['onlyIncludeMetadata']
        sampleIds = data['sampleIds']
        if not sampleIds:
            raise falcon.HTTPBadRequest(description="No samples specified for download")

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        mustClauses = [
            {
                "ids": {
                    "values": sampleIds
                }
            }
        ]
        if not req.context["isAdmin"]:
            mustClauses.append({
                "has_parent": {
                    "type": cfg.ES_STUDY_DOCTYPE,
                    "query": {
                        "term": {
                            "*Visible": True
                        }
                    }
                }
            })

        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE, body={
            "size": len(sampleIds),
            "query": {
                "bool": {
                    "must": mustClauses
                }
            },
            "_source": ["Sample Name"]  # NOTE: this is for later when we subselect samples
        })

        result = {}
        for hit in rawResults["hits"]["hits"]:
            result[hit["_id"]] = hit

        sampleInfos = {}
        for sample in result.itervalues():
            sampleInfos[sample['_id']] = sample['_source']

        # 1. Extract study IDs
        studyIds = set()
        for sample in result.itervalues():
            studyIds.add(sample["_parent"])

        # 1.5 Organize sample and study IDs in a nice hierarchy
        sampleIdsByStudy = defaultdict(list)
        for sample in result.itervalues():
            sampleIdsByStudy[sample["_parent"]].append(sample["_id"])

        # 1.25 Fetch study metadata
        rawResults = es.search(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, body={
            "query": {
                "ids": {
                    "type": cfg.ES_STUDY_DOCTYPE,
                    "values": list(studyIds)
                }
            },
            "_source": ["STUDY.Study Title"]
        })
        studyInfos = {}
        for hit in rawResults['hits']['hits']:
            studyInfos[hit['_id']] = hit['_source']

        # 1.825 Fetch relevant field metadata
        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute(
                """
                SELECT field_name
                FROM dim_meta_meta
                """
            )
            dbResults = cur.fetchall()
            fieldNames = [rawFieldName.decode('utf-8') for (rawFieldName,) in dbResults]
            rawFieldMetas = FieldMeta.from_db_multi(cur, fieldNames)
            fieldMetas = {
                fieldMeta.fieldName: fieldMeta.to_json()
                for fieldMeta in rawFieldMetas
            }
        db_conn.commit()

        # 2. Create download folders / DB records, etc.
        download_uuid = '{download_uuid}'.format(download_uuid=uuid.uuid4())
        download_dir = os.path.join(cfg.DOWNLOADS_PATH, download_uuid)

        # Check for existence out of paranoia
        if os.path.exists(download_dir):
            raise falcon.HTTPInternalServerError("UUID conflict, try again")

        # First note upload in database
        db_conn = req.context['db']
        with db_conn.cursor() as cur:
            cur.execute(
                "INSERT INTO downloads (uuid, status, progress) VALUES (%s, %s, %s)",
                (download_uuid, 'preparing', 0.0))
        db_conn.commit()

        # Now dump bundle creation config into temporary space
        downloadConfig = {
            'onlyIncludeMetadata': onlyIncludeMetadata,
            'targetData': sampleIdsByStudy,
            'studyInfos': studyInfos,
            'sampleInfos': sampleInfos,
            'fieldMetas': fieldMetas
        }
        os.makedirs(download_dir)
        configFilepath = os.path.join(download_dir, 'config.json')
        with open(configFilepath, 'wb') as f:
            f.write(json.dumps(downloadConfig, indent=2, sort_keys=True))

        subprocess.Popen(['./create_download_bundle.py', download_uuid],
                         close_fds=True)
        print(os.getcwd())

        # Final response
        resp.status = falcon.HTTP_CREATED
        resp.location = '/downloads/{0}'.format(download_uuid)
        resp_json = {
            'download_uuid': download_uuid,
            'location': cfg.URL_BASE + resp.location,
            'progressUrl': cfg.URL_BASE + resp.location + '/_progress'
        }
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)


class DownloadProgressResource(object):
    def on_get(self, req, resp, download_uuid):

        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("""
                SELECT status, progress, errorString
                FROM downloads
                WHERE uuid = %s
            """, (download_uuid,))
            results = cur.fetchall()
        db_conn.commit()

        if len(results) == 0:
            raise falcon.HTTPNotFound(description="Download ID {0} doesn't exist".format(download_uuid))
        else:
            ((status, progress, errorString),) = results

            resp.status = falcon.HTTP_OK
            resp_json = {
                'status': status,
                'progress': progress,
                'errorString': errorString
            }
            resp.body = json.dumps(resp_json, indent=2, sort_keys=True)


class DownloadResource(object):
    def on_get(self, req, resp, download_uuid):

        db_conn = req.context["db"]
        with db_conn.cursor() as cur:
            cur.execute("""
                SELECT status, progress, errorString
                FROM downloads
                WHERE uuid = %s
            """, (download_uuid,))
            results = cur.fetchall()
        db_conn.commit()

        if len(results) == 0:
            raise falcon.HTTPNotFound(description="Download ID {0} doesn't exist".format(download_uuid))
        else:
            ((status, progress, errorString),) = results
            if status == 'error':
                raise falcon.HTTPInternalServerError(description=errorString)
            elif status != 'ready':
                raise falcon.HTTPNotFound(description="Download ID {0} is not yet ready ({:.1f}% done).  Try again later"
                                          .format(download_uuid, progress))

            # Check that download bundle exists
            downloadFolder = os.path.join(cfg.DOWNLOADS_PATH, download_uuid)
            downloadBundlePath = os.path.join(downloadFolder, "download_bundle.zip")
            if not os.path.exists(downloadBundlePath):
                raise falcon.HTTPInternalServerError(description="Download ID {0} is supposedly ready, but no download bundle exists on server!"
                                                     .format(download_uuid))

            # OK, ready to download!  Open file so that we can read it even after deletion
            zf = open(downloadBundlePath, 'rb')
            zfLen = os.path.getsize(downloadBundlePath)

            # Clean up download (on Linux & Mac, we can delete the zip file while
            # open; when Falcon is done sending the contents in the response and
            # closes the file, the deletion actually takes place)
            #
            # PV 2017-04-14: Don't clean up automatically immediately after downloads.
            # Instead, wait for stale downloads clean up middleware to remove after 24 hours (or whatever the config says).
            # Some users have reported 404 Not Founds near the end of a download.  Not sure what
            # the underlying problem is, but this band-aid will make the symptoms go away.
            #shutil.rmtree(downloadFolder)
            #with db_conn.cursor() as cur:
            #    cur.execute("DELETE FROM downloads WHERE uuid = %s", (download_uuid,))
            #db_conn.commit()

            # Response
            resp.status = falcon.HTTP_OK
            resp.content_type = 'application/zip'
            resp.append_header("Content-Disposition", 'attachment; filename="download_bundle.zip"')
            resp.stream = zf
            resp.stream_len = zfLen
