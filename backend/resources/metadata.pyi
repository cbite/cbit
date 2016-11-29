from elasticsearch import Elasticsearch
from falcon import Request, Response
from data.filters import FiltersState

class MetadataAllCountsResource(object):
    def on_get(self, req: Request, resp: Response): ...

class MetadataFilteredCountsResource(object):
    def on_post(self, req: Request, resp: Response): ...

class MetadataSamplesInStudies(object):
    def on_post(self, req: Request, resp: Response): ...

class MetadataFields(object):
    def on_post(self, req: Request, resp: Response): ...

class MetadataField(object):
    def on_get(self, req: Request, resp: Response, field_name: str): ...
    def on_post(self, req: Request, resp: Response): ...


class ESQueryPieces(object):
    def __init__(self, shouldClauses: list[dict], mustClause: dict[str, dict], mustNotClause: dict[str, dict]): ...

def buildESQueryEnumerateControls(filters: FiltersState) -> dict: ...
def extractControlIdsFromResultOfESQueryEnumerateControls(esResult: dict) -> list[str]: ...
def buildESQueryPieces(filters: FiltersState, controlStudyIds: list[str]) -> ESQueryPieces: ...
def fetchControlsMatchingFilters(es: Elasticsearch, filters: FiltersState): ...