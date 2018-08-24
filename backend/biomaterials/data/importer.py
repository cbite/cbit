#!/usr/bin/python2.7
import datetime
import sys
import psycopg2
import config.config as cfg
from archive import read_archive
import reader
from elasticsearch import helpers


def connect_to_postgres():
    return psycopg2.connect(host=cfg.DB_HOST, port=cfg.DB_PORT, user=cfg.DB_USER, password=cfg.DB_PASS,
                            database=cfg.DB_NAME)


def import_archive(db_conn, es, archive_filename, study_uuid, visible):
    a = read_archive(archive_filename)

    # Import metadata into ElasticSearch
    study_result = a.investigation

    # Geyt the study type and array express id
    study_type = a.study_type
    arrayExpressId = a.arrayExpressId
    protocol_file_name = a.protocol_file_name

    # Add download URL for now
    study_result['*Archive URL'] = "{url_base}/biomaterials/studies/{study_uuid}/archive".format(
        url_base=cfg.URL_BASE,
        study_uuid=study_uuid
    )

    # Add extra metadata
    study_result['*Study Type'] = study_type
    study_result['*Array Express Id'] = arrayExpressId
    study_result['*Visible'] = visible

    # 4. Load all sample metadata
    clean_study_sample = reader.clean_up_study_samples(a.study_sample, db_conn)
    d = reader.apply_special_treatments_to_study_sample(clean_study_sample)

    samplesResult = []

    for i, (k, v) in enumerate(d.iteritems()):
        vv = v.copy()
        vv['Sample Name'] = k
        vv['_parent'] = str(study_uuid)
        samplesResult.append(vv)

    # 5. Look for supplementary files
    supplementary_files = []
    with db_conn.cursor() as cur:
        query = "SELECT field_name FROM dim_meta_meta WHERE is_supplementary_file_name = %s "
        cur.execute(query, (True,))
        supplementary_file_fields = cur.fetchall()
        db_conn.commit()

    for sample in samplesResult:
        for (fileField,) in supplementary_file_fields:
            if fileField in sample:
                supplementary_file_name = sample[fileField]
                if supplementary_file_name in a.file_names and supplementary_file_name not in supplementary_files:
                    supplementary_files.append(supplementary_file_name)

    study_result['*Supplementary Files'] = ",".join(supplementary_files)
    study_result['*Protocol File'] = protocol_file_name

    # Insert Study
    response = es.index(index=cfg.ES_INDEX, doc_type=cfg.ES_STUDY_DOCTYPE, id=str(study_uuid), refresh=True,
                        body=study_result)

    # First add mappings for all the synthetic fields that may come in (really, really need to refactor all of this stuff)
    newFieldNames = set()
    for sample in samplesResult:
        for name in sample.iterkeys():
            if name.startswith(u'*Phase composition -') or name.startswith(
                    u'*Elements composition -') or name.startswith(u'*Wettability -'):
                newFieldNames.add(name)

    if newFieldNames:
        es.indices.put_mapping(index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE, body={
            "properties": {
                name: {
                    "type": 'double',

                    # Need this for full-text search (see rest of cfg.ES_SAMPLE_DOCTYPE mapping in backend/set_up_dbs.py)
                    "include_in_all": True,

                    # Make sure that all matches are done by exact content
                    # (full-text search is done against the _all field, which *is* analyzed)
                    "index": "not_analyzed",
                }
                for name in newFieldNames
            }
        })

    num_docs_added, errors = helpers.bulk(es, index=cfg.ES_INDEX, doc_type=cfg.ES_SAMPLE_DOCTYPE,
                                          refresh='wait_for',
                                          actions=samplesResult)

    # Now insert study in DB
    with db_conn.cursor() as cur:

        # Study
        cur.execute(
            """
            INSERT INTO studies (uuid, name, type, createdOn)
            VALUES (%s, %s, %s, %s)
            RETURNING uuid
            """,
            [
                study_uuid,
                a.investigation['STUDY']['Study Title'],
                study_type,
                datetime.datetime.now()
            ]
        )
        (study_id,) = cur.fetchone()

    # End of `cur` context
    db_conn.commit()
    return


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.stderr.write("Usage: ./importer.py <study archive (zip file)>")
        raise SystemExit

    _, archive_filename = sys.argv
    import_archive(archive_filename)
