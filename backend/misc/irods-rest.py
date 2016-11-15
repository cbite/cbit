import json
import requests
from requests.auth import HTTPBasicAuth

baseURL = "http://frontend.dev2.rit.unimaas.nl/rest/"
baseDir = "/nlmumc/projects/P000000004"
userName = "d.theunissen@maastrichtuniversity.nl";
passWord = "foobar";


def processCollection(collection):
    print collection['pathOrName']
    url = baseURL + 'collection' + collection['pathOrName'] + "?listing=true"
    head = {'Content-type': 'application/json',
           'Accept': 'application/json'}
    ret = requests.get(url, headers=head, auth=HTTPBasicAuth(userName, passWord))
    jsonParsed = json.loads(ret.content)
    ##Only one child
    if  "children" in jsonParsed["irods-rest.collection"].keys():
        if type(jsonParsed["irods-rest.collection"]["children"]) is dict:
            if jsonParsed["irods-rest.collection"]["children"]['objectType'] == 'COLLECTION':
                processCollection(jsonParsed["irods-rest.collection"]["children"]);
            if jsonParsed["irods-rest.collection"]["children"]['objectType'] == 'DATA_OBJECT':
               print jsonParsed["irods-rest.collection"]['collectionName']+ "/" + jsonParsed["irods-rest.collection"]["children"]['pathOrName']
        ##More than one child
        if type(jsonParsed["irods-rest.collection"]["children"]) is list:
            for collection in jsonParsed["irods-rest.collection"]["children"]:
                if collection['objectType'] == 'COLLECTION':
                    processCollection(collection);
                if collection['objectType'] == 'DATA_OBJECT':
                    print collection['parentPath'] + "/" + collection['pathOrName']

#MAIN
url= baseURL + 'collection' + baseDir + "?listing=true"
head = {'Content-type':'application/json',
             'Accept':'application/json'}

ret = requests.get(url,headers=head, auth=HTTPBasicAuth(userName,passWord))

jsonParsed = json.loads(ret.content)

##Only one child
if type(jsonParsed["irods-rest.collection"]["children"]) is dict:
    if jsonParsed["irods-rest.collection"]["children"]['objectType'] == 'COLLECTION':
        processCollection(jsonParsed["irods-rest.collection"]["children"]);
##More than one child
if type(jsonParsed["irods-rest.collection"]["children"]) is list:
   for collection in jsonParsed["irods-rest.collection"]["children"]:
       if collection ['objectType'] == 'COLLECTION':
           processCollection(collection );



