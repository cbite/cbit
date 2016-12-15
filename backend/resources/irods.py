import falcon
import requests
import json
from config import config as cfg

class IRODSListResource(object):
    def on_get(self, req, resp):
        """
        Get list of available studies from iRODS

        :param req:
        :param resp:
        :return:
        """

        if not req.context["isAdmin"]:
            raise falcon.HTTPForbidden(
                description="Only admins can perform this action")

        url = cfg.IRODS_BASE_URL + 'collection' + cfg.IRODS_BASE_DIR + "?listing=true"
        headers = {
            'Content-type': 'application/json',
            'Accept': 'application/json'
        }

        ret = requests.get(url, headers=headers,
                           auth=requests.auth.HTTPBasicAuth(cfg.IRODS_USERNAME,
                                                            cfg.IRODS_PASSWORD))

        parsed = ret.json()

        resp_json = [
            item['pathOrName'][len(item['parentPath'])+1:]
            for item in parsed['children']
            if item['objectType'] == 'COLLECTION'
        ]

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(resp_json, indent=2, sort_keys=True)