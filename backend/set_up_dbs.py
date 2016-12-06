#!/usr/bin/env python
#
# Clear PostgreSQL and ElasticSearch DBs, set up initial mappings and tables
#
# Note: workaround for incompatibility between OS X and Postgres shared libs:
# DYLD_LIBRARY_PATH="/Applications/Postgres.app/Contents/MacOS/lib" python set_up_dbs.py

import config.config as cfg
import psycopg2
import elasticsearch

def set_up_elasticsearch():

    print("** SETTING UP ELASTICSEARCH **")
    es = elasticsearch.Elasticsearch(
        hosts=[{'host': cfg.ES_HOST, 'port': cfg.ES_PORT}])

    print("- Deleting existing index")
    try:
        es.indices.delete(index=cfg.ES_INDEX)
    except elasticsearch.exceptions.NotFoundError:
        pass  # If it's not there, that's fine!

    # cfg.ES_STUDY_DOCTYPE and cfg.ES_SAMPLE_DOCTYPE need to live in the same index to set up a parent-child relationship
    print("- Creating mappings for cbit index")
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

    print('- Done with ElasticSearch')


def set_up_postgres():
    """See ddl.sql for actual DB statements"""

    print('** SETTING UP POSTGRESQL **')
    db_conn = psycopg2.connect(
        host=cfg.DB_HOST,
        port=cfg.DB_PORT,
        user=cfg.DB_USER,
        password=cfg.DB_PASS,
        database=cfg.DB_NAME
    )

    try:
        with db_conn.cursor() as cur:
            with open('ddl.sql', 'r') as f:

                def filter_comment(line):
                    if '--' in line:
                        return line[:line.index('--')]
                    else:
                        return line.rstrip()

                ddl_lines = [filter_comment(line) for line in f]
                ddl_stmts = ('\n'.join(ddl_lines)).split(';')

                for stmt in ddl_stmts:
                    if stmt.strip():
                        print('- "{0}"'.format(stmt.strip()))
                        cur.execute(stmt.strip())

        print('- Committing all changes')
        db_conn.commit()
    finally:
        db_conn.close()

    print('- Done with PostgreSQL')


if __name__ == "__main__":

    set_up_elasticsearch()
    set_up_postgres()