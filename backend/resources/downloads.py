import json
import falcon
import config.config as cfg
import elasticsearch
import uuid
import os
from collections import defaultdict
import subprocess
import shutil

class DownloadsResource(object):
    def on_post(self, req, resp):
        """
        Start creating a download bundle with the given studies and samples.
        You can query the progress of the bundle creation by GETting /downloads/{download_uuid}/status,
        and then GET the complete bundle at /downloads/{download_uuid}.

        Request Data
        ============
        [
          "SampleId1",
          "SampleId2",
          ...
        ]

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

        if not isinstance(data, list):
            raise falcon.HTTPBadRequest(
                description="Expected JSON array as payload")

        sampleIds = data
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

        # 1. Extract study IDs
        studyIds = set()
        for sample in result.itervalues():
            studyIds.add(sample["_parent"])

        # 1.5 Organize sample and study IDs in a nice hierarchy
        sampleIdsByStudy = defaultdict(list)
        for sample in result.itervalues():
            sampleIdsByStudy[sample["_parent"]].append(sample["_id"])

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
            'targetData': sampleIdsByStudy
        }
        os.makedirs(download_dir)
        configFilepath = os.path.join(download_dir, 'config.json')
        with open(configFilepath, 'wb') as f:
            f.write(json.dumps(downloadConfig, indent=2, sort_keys=True))

        # TODO: Kick off download bundle creation process
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
                SELECT status, progress
                FROM downloads
                WHERE uuid = %s
            """, (download_uuid,))
            results = cur.fetchall()
        db_conn.commit()

        if len(results) == 0:
            raise falcon.HTTPNotFound(description="Download ID {0} doesn't exist".format(download_uuid))
        else:
            ((status, progress),) = results

            resp.status = falcon.HTTP_OK
            resp_json = {
                'status': status,
                'progress': progress
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
            shutil.rmtree(downloadFolder)
            with db_conn.cursor() as cur:
                cur.execute("DELETE FROM downloads WHERE uuid = %s", (download_uuid,))
            db_conn.commit()

            # Response
            resp.status = falcon.HTTP_OK
            resp.content_type = 'application/zip'
            resp.append_header("Content-Disposition", 'attachment; filename="download_bundle.zip"')
            resp.stream = zf
            resp.stream_len = zfLen
