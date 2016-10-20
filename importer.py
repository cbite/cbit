#!/usr/bin/python2.7

import sys
import zipfile
import psycopg2
from collections import defaultdict
import itertools
import pandas as pd
import json


# Config
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "cbit"
DB_PASS = "2076a675b6d813b582977189c13a3279cc9cf02a9aeab01389798d9167cf259c8b247aee9a2be149"
DB_NAME = "cbit"


def connect_to_postgres():
    return psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, database=DB_NAME)


def read_investigation(f):
    # An investigation file looks like this:
    #
    # SECTION HEADER
    # FieldName <TAB> FieldValue { <TAB> FieldValue }* [<TAB>]
    #
    # Field Values may be quoted, and unfortunately, quoted fields may
    # contain raw newlines in them.  So we need to work to parse these files.
    # (and Pandas' built-in readers, which would usually save the day here,
    # don't react well to files with varying numbers of "columns").
    #
    # TODO: No idea how double quotes are themselves quoted in this format

    s = f.read().decode('latin-1')

    # Token generator
    # Yields either '\t', '\n', or a string (with quotes removed)
    def tokens():
        in_quote = False
        cur_token_chars = []
        for c in itertools.chain(s, [None]):

            # Handle quoting properly
            if not in_quote and len(cur_token_chars) == 0 and c == '"':
                in_quote = True
            elif in_quote and c == '"':
                in_quote = False
                yield ''.join(cur_token_chars)
                cur_token_chars = []
            elif in_quote:
                cur_token_chars.append(c)

            elif c in ('\t', '\n', None):
                # Emit current token, if any
                if cur_token_chars:
                    yield ''.join(cur_token_chars)
                    cur_token_chars = []

                if c in ('\t', '\n'):
                    # Emit delimiter as well
                    yield c

            else:
                # Accumulate token
                cur_token_chars.append(c)

    # Line emitter
    def lines():
        tokensInLine = []
        for token in itertools.chain(tokens(), [None]):
            if token in ('\n', None):
                if tokensInLine:
                    yield tokensInLine
                    tokensInLine = []
            else:
                tokensInLine.append(token)

    # Section emitter
    def sections():
        contents = {}
        cur_section = None
        for line in itertools.chain(lines(), [None]):

            if line is None or len(line) == 1:
                # New section
                if cur_section:
                    yield (cur_section, contents)
                    contents = {}
                if line is not None:
                    cur_section = line[0]
            else:
                fieldName = line[0]
                values = [v for v in line[1:] if v != '\t']

                if len(values) == 1:
                    value = values[0]
                else:
                    value = values
                contents[fieldName] = value

    # Put everything together
    return {sectionName: contents for sectionName, contents in sections()}


def read_study_sample(f):
    # A study sample is a regular TSV file, with strings quoted by double-quotes.
    # Fortunately, every line has the same number of columns
    #
    # It describes each sample used in a study (material properties,
    # cell types, reference to control sample, etc.)
    df = pd.read_table(f)
    return df


def read_assay(f):
    # A transcription_micro file describes the technology used to measure
    # gene expression levels in each sample
    df = pd.read_table(f)
    return df


def read_processed_data(f):
    # A processed data file is a flat table of expression strength numbers
    # (in some arbitrary units).  Rows are genes (more precisely, individual
    # probes in the gene chip), columns are samples
    df = pd.read_table(f, index_col=0)
    return df


def read_annotations(f):
    # An annotations file is a gene-chip-vendor-provided spec of what each
    # probe (row in processed data) is actually talking about
    #
    # Starts with a bunch of comment lines with descriptions of each column
    # (ignore for now)
    df = pd.read_table(f, comment='#')
    return df


def import_archive(archive_filename):
    with zipfile.ZipFile(archive_filename, mode='r') as z:
        filenames = z.namelist()

        # This is the only hard-coded filename
        investigation_file_name = 'i_Investigation.txt'
        if investigation_file_name not in filenames:
            raise IOError('Investigation file "{0}" is missing from archive'.format(investigation_file_name))

        with z.open(investigation_file_name, 'r') as f:
            investigation = read_investigation(f)

        # TODO: Support more than one study and assay per investigation
        if 'STUDY' not in investigation:
            raise ValueError('No STUDY section defined in {0}'.format(investigation_file_name))
        for v in investigation['STUDY'].values():
            if type(v) == list:
                raise NotImplementedError('Not sure how to handle multiple studies per investigation')
        required_STUDY_fields = frozenset([
            'Study Identifier',
            'Study Title',
            'Study File Name',
        ])
        if not required_STUDY_fields.issubset(investigation['STUDY'].keys()):
            raise ValueError('Missing entries in STUDY section: {0}'.format(required_STUDY_fields.difference(investigation['STUDY'].keys())))

        study_file_name = investigation['STUDY']['Study File Name']
        if study_file_name not in filenames:
            raise IOError('Study file "{0}" is missing from archive'.format(study_file_name))
        with z.open(study_file_name, 'r') as f:
            study_sample = read_study_sample(f)

        # TODO: Support more than one study and assay per investigation
        if 'STUDY ASSAYS' not in investigation:
            raise ValueError('No STUDY ASSAYS section defined in {0}'.format(investigation_file_name))
        for v in investigation['STUDY ASSAYS'].values():
            if type(v) == list:
                raise NotImplementedError('Not sure how to handle multiple assays per investigation')
        required_STUDY_ASSAYS_fields = frozenset(['Study Assay File Name'])
        if not required_STUDY_ASSAYS_fields.issubset(investigation['STUDY ASSAYS'].keys()):
            raise ValueError('Missing entries in STUDY ASSAYS section: {0}'.format(required_STUDY_ASSAYS_fields.difference(investigation['STUDY ASSAYS'].keys())))

        assay_file_name = investigation['STUDY ASSAYS']['Study Assay File Name']
        if assay_file_name not in filenames:
            raise IOError('Assay file "{0}" is missing from archive'.format(assay_file_name))
        with z.open(assay_file_name, 'r') as f:
            assay = read_assay(f)

        # TODO: Support multiple data set files per study
        if len(set(assay['Derived Array Data Matrix File'])) != 1:
            raise NotImplementedError('Multiple data set files per study')
        processedDataFilename = assay['Derived Array Data Matrix File'].iloc[0]
        if processedDataFilename not in filenames:
            raise IOError('Processed data file "{0}" is missing from archive'.format(processedDataFilename))
        with z.open(processedDataFilename, 'r') as f:
            processed_data_set = read_processed_data(f)

        # Check that processed data file for a sample actually includes data for each sample
        for sampleName in study_sample['Sample Name']:
            if sampleName not in processed_data_set.columns:
                raise ValueError("Sample {0} has no corresponding data in {1}".format(sampleName, processedDataFilename))

        # And check that every column in the processed data has an associated sample in the study
        for sampleName in processed_data_set.columns:
            if sampleName not in study_sample['Sample Name'].values:
                raise ValueError("No sample metadata for sample {0} in {1}".format(sampleName, processedDataFilename))

        # TODO: Support multiple annotation files per study
        if len(set(assay['Comment[Annotation file]'])) != 1:
            raise NotImplementedError('Multiple annotation files per study')
        annotationFilename = assay['Comment[Annotation file]'].iloc[0]
        if annotationFilename not in filenames:
            raise IOError('Annotations file "{0}" is missing from archive'.format(annotationFilename))
        with z.open(annotationFilename, 'r') as f:
            annotationData = read_annotations(f)

        # Skip raw data for now

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
                        investigation['STUDY']['Study Identifier'],
                        investigation['STUDY']['Study Title'],
                        json.dumps(investigation)
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
                    + ", ".join(["(DEFAULT, %s, %s, NULL, %s)"] * len(study_sample))
                    + " RETURNING id",

                    [x for i, df_row in study_sample.iterrows()
                       for x in sample_row_params(df_row)]
                )
                sample_ids = [id for (id,) in cur.fetchall()]
                study_sample['sample_id'] = sample_ids

                # cur.execute(
                #     """
                #     UPDATE dim_sample AS child
                #     SET child.control_sample_id = parent.id
                #     FROM dim_sample AS parent
                #     WHERE parent.study_id = %s AND
                #           child.study_id = %s AND
                #           parent.name = child.extra_info->'Characteristics[Sample Match]'
                #     RETURNING child.id
                #     """,
                #     [study_id, study_id]
                # )
                # updated_ids = [id for (id,) in cur.fetchall()]
                # print("Updated sample ids {0}".format(updated_ids))
                # assert set(updated_ids) == set(study_sample[-study_sample['Characteristics[Sample Match]'].isnull()]['id'])

                # Assays
                sample_ids_with_name = study_sample[['sample_id', 'Sample Name']]
                assays_with_sample_ids = assay.merge(sample_ids_with_name,
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
                for i, dfChunk in enumerate(chunks(annotationData, 2000)):
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

                    print("{0} of {1} chunks for annotations".format(i, len(annotationData) // 2000))

                annotationData['probe_id'] = probe_ids

                # Processed data
                stackedData = processed_data_set.stack()
                stackedData.index.rename(['probeName', 'sampleName'], inplace=True)
                stackedData.name = 'value'

                dataForDB = (
                    stackedData
                    .reset_index()
                    .merge(annotationData[['probe_id', 'ID']], left_on='probeName', right_on='ID')
                    .merge(study_sample[['sample_id', 'Sample Name']], left_on='sampleName', right_on='Sample Name')
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

    _, archive_filename = sys.argv
    import_archive(archive_filename)