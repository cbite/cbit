import os
from collections import defaultdict

import config.config as cfg
import falcon
import elasticsearch
import json

from data.filters import FiltersState, SampleFilter, FilterMode

HIDDEN_SAMPLE_FILTER_LABELS = frozenset((
  'Barcode',
  'Biological Replicate',
  'Sample ID',
  'Sample Name',
  'Source Name',
  'Study ID',
  'Group ID',
  'Protocols',
  'Sample Match',

  # Fields that have been merged in backend
  'Material Name',
  'Material abbreviation',
  'Strain full name',
  'Strain abbreviation',
  'Compound',
  'Compound abbreviation',
))
NULL_CATEGORY_NAME = '<None>'

class MetadataAllCountsResource(object):
    def on_get(self, req, resp):
        """
        Return a JSON response with all metadata property names and
        values (with approx counts).  E.g.,

        {
          "*Compound": {
            "8-br-cAMP - 8-bromo-cAMP": 6,
            "<None>": 123,
            "db-cAMP - dibutyryl-cAMP": 6
          },
          "*Elements composition - % Ca": {
            "1000.0": 12,
            "1225.0": 3,
            "1250.0": 3,
            "1900.0": 12,
            "<None>": 105
          },
          ...
        }
        """

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        if not es.indices.exists('cbit'):
            raise falcon.HTTPInternalServerError(description='ElasticSearch database not ready.  Have you run set_up_dbs.py?')

        sample_mapping = es.indices.get_mapping(index='cbit',
                                                doc_type='sample')
        properties = sample_mapping['cbit']['mappings']['sample']['properties']

        aggs_to_query = {
            propName: {
                "terms": {
                    "field": propName,
                    "missing": "<None>",
                    "size": 10000,  # TODO: Think this through better
                    "order": {"_term": "asc"}
                }
            }

            for propName in properties
            if propName not in HIDDEN_SAMPLE_FILTER_LABELS
        }

        result = es.search(index='cbit', doc_type='sample', body={
            "size": 0,
            "aggs": aggs_to_query
        })

        processed_results = {
            propName: {
                bucketEntry['key']: bucketEntry['doc_count']
                for bucketEntry in propAgg['buckets']
                }
            for propName, propAgg in result['aggregations'].iteritems()
        }

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(processed_results, indent=2, sort_keys=True)


class MetadataFilteredCountsResource(object):
    def on_post(self, req, resp):
        """
        Request data
        ============

         {
           "filters": {
             ...   (front-end filters object of type FiltersState, see below)
           },
           "categories": [
             "*Compound",
             "*Elements composition - % Ca",
             ...
           ]
         }

        Response
        ========
        {
          "*Compound": {
            "8-br-cAMP - 8-bromo-cAMP": 6,
            "<None>": 123,
            "db-cAMP - dibutyryl-cAMP": 6
          },
          "*Elements composition - % Ca": {
            "1000.0": 12,
            "1225.0": 3,
            "1250.0": 3,
            "1900.0": 12,
            "<None>": 105
          },
          ...
        }
        """

        # Need to be careful when building up counts of values for each
        # category: for each category, we apply all filters *except* the one
        #  being queried (so we get a count of all studies that would be
        # included if we allow a particular value for this
        # category-subcategory pair)

        data = json.load(req.stream)
        filters = FiltersState.from_json(data['filters'])  # type: FiltersState
        categories = data['categories']                    # type: list[str]

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        controlIds = fetchControlsMatchingFilters(es, filters)

        q = buildESQueryPieces(filters, controlIds)
        aggs = {}

        allFiltersAggs = {}
        aggs["all_filters"] = {
            "filter": {
                "bool": {
                    "should": [
                        { "terms": { "Sample Name": controlIds } },   # Include controls no matter what
                        {
                            "bool": {
                                "must": q.mustClause.values(),
                                "must_not": q.mustNotClause.values()
                            }
                        }
                    ]
                }
            },
            "aggs": allFiltersAggs
        }

        for category in categories:

            thisAgg = aggs["all_filters"]["aggs"]

            if category in q.mustClause or category in q.mustNotClause:

                # Special filter for this category
                theseMustClauses = {
                    cat: clause
                    for cat, clause in q.mustClause.iteritems()
                    if cat != category
                }
                theseMustNotClauses = {
                    cat: clause
                    for cat, clause in q.mustNotClause.iteritems()
                    if cat != category
                }

                thisAgg = {}
                aggs["Filtered " + category] = {
                    "filter": {
                        "bool": {
                            "should": [
                                { "terms": { "Sample Name": controlIds } },  # Include controls no matter what
                                {
                                    "bool": {
                                        "must": theseMustClauses,
                                        "must_not": theseMustNotClauses
                                    }
                                }
                            ]
                        }
                    },
                    "aggs": thisAgg
                }
            else:
                thisAgg = allFiltersAggs
            pass # endif category in q.mustClause or category in q.mustNotClause:

            thisAgg[category] = {
                "terms": {
                    "field": category,
                    "missing": NULL_CATEGORY_NAME,
                    "size": 100,  # Return first 100 field values
                    "order": { "_term": "asc" }
                }
            }

        rawAggs = es.search(index="cbit", doc_type="sample", body={
            "query": {
                "bool": {
                    "should": q.shouldClauses
                }
            },
            "size": 0,     # TODO: Think about sizes
            "aggs": aggs
        })

        result = {}
        for oneAggSet in rawAggs["aggregations"].itervalues():
            for category in oneAggSet:
                if category != 'doc_count':
                    result[category] = {
                        bucket["key"]: bucket["doc_count"]
                        for bucket in oneAggSet[category]["buckets"]
                    }

        resp.status = falcon.HTTP_200
        resp.body = json.dumps(result, indent=2, sort_keys=2)


class MetadataSamplesInStudies(object):
    def on_post(self, req, resp):
        """
        Get Sample IDs of samples associate with multiple studies


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
          "StudyID123": [ "SampleA", "SampleB", ... ],
          "StudyID456": [ "SampleX", "SampleY", ... ],
          ...
        }
        """

        studyIds = json.load(req.stream)

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        rawResults = es.search(
            index='cbit', doc_type='sample', _source=["_id"], body={
                "size": 1000 * len(studyIds),  # TODO: Think this through
                "query": {
                    "has_parent": {
                        "parent_type": "study",
                        "query": {
                            "ids": {
                                "values": studyIds
                            }
                        }
                    }
                }
            }
        )

        result = defaultdict(list)
        for hit in rawResults["hits"]["hits"]:
            result[hit["_parent"]].append(hit["_id"])

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)


class MetadataSearch(object):
    def on_post(self, req, resp):
        """
        Search for all samples that match the given filters

        Request data
        ============
        {
           "filters": {
             ...   (front-end filters object of type FiltersState, see below)
           }
         }

        Response data
        =============
        {
          "StudyID123": {
            "SampleID_1",
            "SampleID_2",
            ...
          },
          "StudyID456": {
            "SampleID_X",
            "SampleID_Y",
            ...
          },
          ...
        }
        """

        data = json.load(req.stream)
        filters = FiltersState.from_json(data['filters'])  # type: FiltersState

        es = elasticsearch.Elasticsearch(
            hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

        controlIds = fetchControlsMatchingFilters(es, filters)

        q = buildESQueryPieces(filters, controlIds)  # type: ESQueryPieces
        rawResults = es.search(index='cbit', doc_type='sample', _source=False, body={
            "query": {
                "bool": {
                    "should": [
                        { "terms": { "Sample Name": controlIds } },  # Include controls no matter what
                        {
                            "bool": {
                                "should": q.shouldClauses,
                                "must": q.mustClause.values(),
                                "must_not": q.mustNotClause.values(),
                                "minimum_should_match": 1
                            }
                        }
                    ]
                }
            },
            "size": 10000   # TODO: Think about sizes
        })

        result = defaultdict(list)
        for hit in rawResults["hits"]["hits"]:
            result[hit["_parent"]].append(hit["_id"])

        resp.status = falcon.HTTP_OK
        resp.body = json.dumps(result, indent=2, sort_keys=True)


# HELPER FUNCTIONS
# ================


class ESQueryPieces(object):
    def __init__(self, shouldClauses, mustClause, mustNotClause):
        self.shouldClauses = shouldClauses
        self.mustClause = mustClause
        self.mustNotClause = mustNotClause


def buildESQueryPieces(filters, controlStudyIds = []):

    shouldClauses = []  # type: list[dict]
    mustClause = {}     # type: dict[str, dict]
    mustNotClause = {}  # type: dict[str, dict]

    if filters.searchText:
        shouldClauses = [
            {
                "match_phrase": {
                    "_all": filters.searchText
                }
            },
            {
                "has_parent": {
                    "type": "study",
                    "query": {
                        "match_phrase": {
                            "_all": filters.searchText
                        }
                    }
                }
            }
        ]
    else:
        shouldClauses = [
            {
                "match_all": {}
            }
        ]

    if controlStudyIds:
        shouldClauses.append({
            "terms": {
                "Sample Name": controlStudyIds
            }
        })

    for category, sampleFilter in filters.sampleFilters.iteritems():
        queryClause = {
            "terms": {
                category: [k for k in sampleFilter.detail.iterkeys() if k != NULL_CATEGORY_NAME]
            }
        }

        if NULL_CATEGORY_NAME in sampleFilter.detail:
            queryClause = {
                "bool": {
                    "should": [
                        { "bool": { "must_not": { "exists": { "field": category } } } },
                        queryClause
                    ]
                }
            }

        if sampleFilter.mode == FilterMode.AllButThese:
            mustNotClause[category] = queryClause
        elif sampleFilter.mode == FilterMode.OnlyThese:
            mustClause[category] = queryClause

    return ESQueryPieces(shouldClauses, mustClause, mustNotClause)


def buildESQueryEnumerateControls(filters):
    # Relevant controls are listed in the results under
    # results.aggregations.controls.buckets[*].key

    queryPieces = buildESQueryPieces(filters)  # type: ESQueryPieces
    extraMustClauses = queryPieces.mustClause.values()
    extraMustNotClauses = queryPieces.mustNotClause.values()

    return {
      "size": 0,  # We only care about the aggregation below
      "query": {
        "bool": {
          "should": queryPieces.shouldClauses,
          "must": [
              { "exists": { "field": "Sample Match" } }
          ] + extraMustClauses,
          "must_not": extraMustNotClauses,
          "minimum_should_match": 1
        }
      },
      "aggs": {
        "controls": {
          "terms": {
            "field": "Sample Match",
            "size": 10000   # TODO: Think harder about upper limits
          }
        }
      }
    }


def extractControlIdsFromResultOfESQueryEnumerateControls(esResult):
    return [bucket["key"]
            for bucket in esResult["aggregations"]["controls"]["buckets"]]


def fetchControlsMatchingFilters(es, filters):
    if filters.includeControls:
        rawControls = es.search(index='cbit', doc_type='sample',
                                body=buildESQueryEnumerateControls(filters))
        return extractControlIdsFromResultOfESQueryEnumerateControls(rawControls)
    else:
        return []
