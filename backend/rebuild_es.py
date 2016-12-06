#! /usr/bin/env python
#
# A script to reconstruct the ElasticSearch database from scratch
# (derived from the "ElasticSearchPrototype.ipynb" notebook
#
# Note: for now, download URLs point to localhost:12345.  Run a simple
# HTTP server on localhost in the data directory for those URLs to work, as follows:
#
#  cd ../../data/new_ISAcreatorArchives/
#  python -c 'import BaseHTTPServer as bhs, SimpleHTTPServer as shs; bhs.HTTPServer(("127.0.0.1", 12345), shs.SimpleHTTPRequestHandler).serve_forever()'
#
# ["one-liner" from http://stackoverflow.com/a/12269225]

import sys
sys.path.append('..')

import elasticsearch
from elasticsearch import helpers
import config.config as cfg
import data.reader
import json

import sys
sys.stderr.write(
"""ERROR: This file is now obsolete!  Run ./set_up_dbs.py to wipe and prepare the databases,
then use the upload functionality in the web UI to upload new studies.

The file is preserved in case the source code is ever useful during a refactor later,
but will be removed before the end of the project.
""")
raise SystemExit

# 0. Connect to DB
es = elasticsearch.Elasticsearch(hosts=[{'host': 'localhost', 'port': 9200}])

# 1. Clear everything
es.indices.delete(index='*')

# 2. Set up mappings
# cfg.ES_STUDY_DOCTYPE and cfg.ES_SAMPLE_DOCTYPE need to live in the same index to set up a parent-child relationship
es.indices.create(index=cfg.ES_INDEX, body={
    "settings": {
        # Set up indexing to support efficient search-as-you-type
        # (see https://www.elastic.co/guide/en/elasticsearch/guide/current/_index_time_search_as_you_type.html)
        "analysis": {
            "filter": {
                "autocomplete_filter": {
                    "type": "edge_ngram",
                    "min_gram": 1,
                    "max_gram": 20
                }
            },
            "analyzer": {
                "autocomplete": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "autocomplete_filter"
                    ]
                }
            }
        }
    },

    "mappings": {
        cfg.ES_STUDY_DOCTYPE: {
            # Prevent creation of dynamic fields
            # (when adding studies with new fields, these should be presented to the
            #  user for explicit typing)
            # "dynamic": "strict",
            # TODO: For the moment, though, allow dynamic mapping, just ensure that
            # everything is mapped as a string below
            "dynamic": True,

            "dynamic_templates": [
                {
                    # Some fields are objects (names are all in uppercase)
                    "object_fields": {
                        "match_pattern": "regex",
                        "path_match": r"^([A-Z ]+)$",
                        "mapping": {
                            "type": "object"
                        }
                    }
                },

                {
                    # Some fields should have full-text search enabled
                    "fts_fields": {
                        "match_pattern": "regex",
                        "path_match": r"^.*\.({0})$".format("|".join([
                            "Study Researchers Involved",
                            "Study PubMed ID",
                            "Study Publication Author List",
                        ])),
                        "mapping": {
                            # Everything is a string for now (improve this during Sprint #3)
                            "type": "string",

                            # Make sure that all matches are done by exact content
                            # (full-text search is done against the _all field, which *is* analyzed)
                            "index": "not_analyzed",

                            "include_in_all": True
                        }
                    }
                },

                {
                    # Everything else is excluded from full-text search
                    "default": {
                        "match": "*",
                        "mapping": {
                            # Everything is a string for now (improve this during Sprint #3)
                            "type": "string",

                            # Make sure that all matches are done by exact content
                            # (full-text search is done against the _all field, which *is* analyzed)
                            "index": "not_analyzed",

                            "include_in_all": False
                        }
                    }
                }
            ],

            "_all": {
                # Do analyze everything in the study metadata that can be searched by
                # full-text search.  Use autocomplete analyzer above to split words on
                # word boundaries, lowercase everything and produce edge n-grams in index.
                # But don't produce edge n-grams during searching
                "index": "analyzed",
                "analyzer": "autocomplete",
                "search_analyzer": "standard"
            },
        },

        cfg.ES_SAMPLE_DOCTYPE: {

            # Set up parent-child relationship with cfg.ES_STUDY_DOCTYPE
            "_parent": {
                "type": cfg.ES_STUDY_DOCTYPE
            },

            # Prevent creation of dynamic fields
            # (when adding studies with new fields, these should be presented to the
            #  user for explicit typing)
            # "dynamic": "strict",
            # TODO: For the moment, though, allow dynamic mapping, just ensure that
            # everything is mapped as a string below
            "dynamic": True,

            "dynamic_templates": [
                {
                    # Everything sample metadata is full-text searchable
                    "default": {
                        "match": "*",
                        "mapping": {
                            # Everything is a string for now (improve this during Sprint #3)
                            "type": "string",

                            # Make sure that all matches are done by exact content
                            # (full-text search is done against the _all field, which *is* analyzed)
                            "index": "not_analyzed",

                            "include_in_all": True
                        }
                    }
                }
            ],

            "_all": {
                # Do analyze everything in the study metadata that can be searched by
                # full-text search.  Use autocomplete analyzer above to split words on
                # word boundaries, lowercase everything and produce edge n-grams in index.
                # But don't produce edge n-grams during searching
                "index": "analyzed",
                "analyzer": "autocomplete",
                "search_analyzer": "standard"
            },
        }
    }
})

# 3. Load study metadata
i = reader.read_investigation(open('../../data/new_ISAcreatorArchives/StudyID_01_archive/i_Investigation.txt', 'r'))
result = reader.conform_investigation_to_schema(
                reader.remove_isa_name_prefixes(
                  reader.remove_empty_values_in_dict(
                    reader.flatten_investigation(
                      i
                    )
                  )
                )
              )
# Add fake download URL for now
result['*Archive URL'] = "http://localhost:12345/StudyID_01_archive.zip"

response = es.index(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, body=result)
study1_id = response['_id']
print("Study 1 ID is '{0}'".format(study1_id))

i = reader.read_investigation(open('../../data/new_ISAcreatorArchives/StudyID_02_archive/i_Investigation.txt', 'r'))
result = reader.conform_investigation_to_schema(
               reader.remove_isa_name_prefixes(
                 reader.remove_empty_values_in_dict(
                   reader.flatten_investigation(
                     i
                   )
                 )
               )
             )
# Add fake download URL for now
result['*Archive URL'] = "http://localhost:12345/StudyID_02_archive.zip"

response = es.index(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, body=result)
study2_id = response['_id']
print("Study 2 ID is '{0}'".format(study2_id))

# 4. Load all sample metadata
a = reader.read_assay(open('../../data/new_ISAcreatorArchives/StudyID_01_archive/a_transcription_micro_1.txt', 'r'))
s = reader.read_study_sample(open('../../data/new_ISAcreatorArchives/StudyID_01_archive/s_study_sample.txt', 'r'))
d = reader.join_study_sample_and_assay(reader.clean_up_study_samples(s), reader.clean_up_assay(a))
d = reader.apply_special_treatments_to_study_sample(d)
a2 = reader.read_assay(open('../../data/new_ISAcreatorArchives/StudyID_02_archive/a_transcription_micro_1.txt', 'r'))
s2 = reader.read_study_sample(open('../../data/new_ISAcreatorArchives/StudyID_02_archive/s_study_sample.txt', 'r'))
d2 = reader.join_study_sample_and_assay(reader.clean_up_study_samples(s2), reader.clean_up_assay(a2))
d2 = reader.apply_special_treatments_to_study_sample(d2)

result = []

for i, (k, v) in enumerate(d.iteritems()):
    vv = v.copy()
    vv['Sample Name'] = k
    vv['_parent'] = study1_id
    result.append(vv)

for i, (k, v) in enumerate(d2.iteritems()):
    vv = v.copy()
    vv['Sample Name'] = k
    vv['_parent'] = study2_id
    result.append(vv)

num_docs_added, errors = helpers.bulk(es, index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE, actions=result)
print("Metadata ingested for {0} samples".format(num_docs_added))

