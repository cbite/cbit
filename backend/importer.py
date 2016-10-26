#!/usr/bin/python2.7

import sys
import zipfile
import psycopg2
import json
from config import Config
from archive import read_archive

def connect_to_postgres(cfg):
    return psycopg2.connect(host=cfg.DB_HOST, port=cfg.DB_PORT, user=cfg.DB_USER, password=cfg.DB_PASS, database=cfg.DB_NAME)




def import_archive(cfg, archive_filename):
    a = read_archive()

    # Now add columns to SQL
    with connect_to_postgres() as conn:
        with conn.cursor() as cur:

            # Study
            cur.execute(
                """
                INSERT INTO dim_study (id, name, title, extra_info)
                VALUES (DEFAULT, %s, %s, %s)
                RETURNING id
                """,
                [
                    a.investigation['STUDY']['Study Identifier'],
                    a.investigation['STUDY']['Study Title'],
                    json.dumps(a.investigation)
                ]
            )
            (study_id,) = cur.fetchone()

            # Samples
            # First set control_sample_id to NULL, then update
            def sample_row_params(df_row):
                return [study_id, df_row['Sample Name'],
                        json.dumps(df_row.dropna().to_dict())]

            cur.execute(
                """
                INSERT INTO dim_sample (id, study_id, name, control_sample_id, extra_info)
                VALUES
                """
                + ", ".join(["(DEFAULT, %s, %s, NULL, %s)"] * len(a.study_sample))
                + " RETURNING id",

                [x for i, df_row in a.study_sample.iterrows()
                   for x in sample_row_params(df_row)]
            )
            sample_ids = [id for (id,) in cur.fetchall()]
            a.study_sample['sample_id'] = sample_ids

            cur.execute(
                """
                UPDATE dim_sample AS child
                SET child.control_sample_id = parent.id
                FROM dim_sample AS parent
                WHERE parent.study_id = %s AND
                      child.study_id = %s AND
                      parent.name = child.extra_info->>'Characteristics[Sample Match]'
                RETURNING child.id
                """,
                [study_id, study_id]
            )
            updated_ids = [id for (id,) in cur.fetchall()]
            print("Updated sample ids {0}".format(updated_ids))
            assert set(updated_ids) == set(a.study_sample[-a.study_sample['Characteristics[Sample Match]'].isnull()]['id'])

            # Assays
            sample_ids_with_name = a.study_sample[['sample_id', 'Sample Name']]
            assays_with_sample_ids = a.assay.merge(sample_ids_with_name,
                                                 on='Sample Name')
            cur.executemany(
                """
                INSERT INTO dim_assay (id, sample_id, extra_info)
                VALUES (DEFAULT, %s, %s)
                """,
                [[df_row['sample_id'], json.dumps(df_row.dropna().to_dict())]
                 for i, df_row in assays_with_sample_ids.iterrows()]
            )


            # Interlude: chunking adapted from http://stackoverflow.com/questions/3992735/python-generator-that-groups-another-iterable-into-groups-of-n
            def chunks(df, n):
                for i in xrange(0, len(df), n):
                    yield df.iloc[i:i+n]

            # Annotations
            probe_ids = []
            for i, dfChunk in enumerate(chunks(a.annotationData, 2000)):
                cur.execute(
                    """
                    INSERT INTO dim_probe (id, name, extra_info)
                    VALUES
                    """
                    + ', '.join(["(DEFAULT, %s, %s)"] * len(dfChunk))
                    + " RETURNING id",
                    [x
                     for _, df_row in dfChunk.iterrows()
                     for x in [df_row['ID'], json.dumps(df_row.dropna().to_dict())]]
                )

                probe_ids.extend([id for (id,) in cur.fetchall()])

                print("{0} of {1} chunks for annotations".format(i, len(a.annotationData) // 2000))

            a.annotationData['probe_id'] = probe_ids

            # Processed data
            stackedData = a.processed_data_set.stack()
            stackedData.index.rename(['probeName', 'sampleName'], inplace=True)
            stackedData.name = 'value'

            dataForDB = (
                stackedData
                .reset_index()
                .merge(a.annotationData[['probe_id', 'ID']], left_on='probeName', right_on='ID')
                .merge(a.study_sample[['sample_id', 'Sample Name']], left_on='sampleName', right_on='Sample Name')
             )[['probe_id', 'sample_id', 'value']]

            for i, dfChunk in enumerate(chunks(dataForDB, 1000)):
                cur.execute(
                    """
                    INSERT INTO fact_processed_datum (probe_id, sample_id, value)
                    VALUES
                    """
                    + ', '.join(["(%s, %s, %s)"] * len(dfChunk)),
                    [x
                     for _, r in dfChunk.iterrows()
                     for x in [r['probe_id'], r['sample_id'], r['value']]]
                )
                #cur.executemany(
                #    """
                #    INSERT INTO fact_processed_datum (probe_id, sample_id, value) VALUES (%s, %s, %s)
                #    """,
                #    [[r['probe_id'], r['sample_id'], r['value']] for _, r in dfChunk.iterrows()]
                #)

                print("{0} of {1} chunks for processed data".format(i, len(
                    dataForDB) // 1000))

        # End of `cur` context
        print('ALL DONE!')
        conn.commit()   # For now, keep the database clean


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.stderr.write("Usage: ./importer.py <study archive (zip file)>")
        raise SystemExit

    cfg = Config()
    _, archive_filename = sys.argv
    import_archive(cfg, archive_filename)