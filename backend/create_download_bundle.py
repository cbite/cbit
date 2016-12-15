#!/usr/bin/env python

import config.config as cfg
import psycopg2
import sys
import os
import json
import time
import zipfile
import re
from data.archive import read_archive
from data import reader
import tempfile
import pandas as pd
from StringIO import StringIO

INIT_PROGRESS = 10   # % progress represented just by kickstarting bundling process
MAX_FILENAME_LEN = 31

class StudyFolderNameGenerator(object):
    def __init__(self, studyInfos):
        self.existingNames = set()
        self.studyInfos = studyInfos

    def genName(self, studyId):
        studyTitle = self.studyInfos[studyId]['STUDY']['Study Title']
        origSafeStudyTitle = re.sub(r'[^a-zA-Z0-9\-_]', '', studyTitle) or "study"
        if len(origSafeStudyTitle) > MAX_FILENAME_LEN:
            safeStudyTitle = origSafeStudyTitle[:MAX_FILENAME_LEN-3] + '...'
        else:
            safeStudyTitle = origSafeStudyTitle

        i = 0
        tryName = safeStudyTitle
        while tryName in self.existingNames:
            i = i+1
            iStr = str(i)
            if len(origSafeStudyTitle) > (MAX_FILENAME_LEN - 1 - len(iStr) - 1):
                tryName = origSafeStudyTitle[:MAX_FILENAME_LEN-3 - 1 - len(iStr) - 1] + '...({0})'.format(iStr)
            else:
                tryName = origSafeStudyTitle + '({0})'.format(iStr)

        self.existingNames.add(tryName)
        return tryName

class ProgressManager(object):
    def __init__(self):
        self.db_conn = psycopg2.connect(
            host=cfg.DB_HOST,
            port=cfg.DB_PORT,
            user=cfg.DB_USER,
            password=cfg.DB_PASS,
            database=cfg.DB_NAME
        )

        with self.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE downloads
                SET
                  progress = %s,
                  pid = %s
                WHERE uuid = %s
            """, (INIT_PROGRESS, os.getpid(), download_uuid))
        self.db_conn.commit()

    def update(self, progress):
        with self.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE downloads
                SET
                  progress = %s
                WHERE uuid = %s
            """, (INIT_PROGRESS + ((100. - INIT_PROGRESS) / 100) * (100 * progress), download_uuid))
        self.db_conn.commit()

    def done(self):
        with self.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE downloads
                SET
                  status = 'ready',
                  progress = 100
                WHERE uuid = %s
            """, (download_uuid,))
        self.db_conn.commit()

    def error(self, errorString):
        with self.db_conn.cursor() as cur:
            cur.execute("""
                UPDATE downloads
                SET
                  status = 'error',
                  progress = 100,
                  errorString = %s
                WHERE uuid = %s
            """, (errorString, download_uuid,))
        self.db_conn.commit()

if len(sys.argv) != 2:
    sys.stderr.write("Usage: create_download_bundle.py <download_uuid>")
    raise SystemExit

download_uuid = sys.argv[1]
download_folder = os.path.join(cfg.DOWNLOADS_PATH, download_uuid)
with open(os.path.join(download_folder, 'config.json')) as f:
    download_config = json.load(f)

progress = ProgressManager()

try:
    # For now, just bundle the individual studies as they are, no sample subselection
    studyAndSampleIds = download_config['targetData']
    studyInfos = download_config['studyInfos']
    sampleInfos = download_config['sampleInfos']

    studyFolderNameGen = StudyFolderNameGenerator(studyInfos)

    with zipfile.ZipFile(os.path.join(download_folder, "download_bundle.zip"), "w", zipfile.ZIP_DEFLATED) as zf:

        for (studyNum, studyId) in enumerate(download_config['targetData'].iterkeys()):

            studyArchivePath = os.path.join(cfg.FILES_PATH, studyId, 'archive.zip')
            studyFolderName = studyFolderNameGen.genName(studyId)

            # Ingest data in raw form
            a = read_archive(studyArchivePath, only_metadata=False)

            with zipfile.ZipFile(studyArchivePath, "r") as studyZf:

                # Copy over basic files
                zf.writestr(
                    os.path.join(studyFolderName, a.investigation_file_name),
                    studyZf.read(a.investigation_file_name)
                )

                # Lightly process study sample & assay files
                sampleInfo = reader.join_study_sample_and_assay(
                    reader.clean_up_study_samples(a.study_sample),
                    reader.clean_up_assay(a.assay)
                )

                # Find sample names of all selected samples
                sampleNames = set()
                for sampleId in studyAndSampleIds[studyId]:
                    sampleNames.add(sampleInfos[sampleId]['Sample Name'])

                # Subselect only relevant samples
                sampleInfo = {sampleName: info
                              for sampleName, info in sampleInfo.iteritems()
                              if sampleName in sampleNames}

                # Write study sample info out
                df = pd.DataFrame.from_dict(sampleInfo, orient='index', dtype='str')
                sio = StringIO()
                df = df.reindex_axis(sorted(df.columns), axis=1)   # TODO: Fix sorting so that units always come right after unitful quantity
                df.to_csv(sio, index_label='Sample Name', encoding='utf-8')
                zf.writestr(
                    os.path.join(studyFolderName, "sample_info.csv"),
                    sio.getvalue()
                )

                # Subselect relevant samples in processed data
                # (sometimes the column names do not match sample names; in that
                # case, match columns in the processed data one-to-one with
                # rows in the study_sample file).
                if a.processed_data_set is not None:
                    processed_data_columns_names = set(a.processed_data_set.columns.values)
                    if not sampleNames.issubset(processed_data_columns_names):
                        sampleNameIndices = {}
                        for i, row in a.study_sample.iterrows():
                            sampleNameIndices[row['Sample Name']] = i
                        df = a.processed_data_set.iloc[:, [sampleNameIndices[sampleName] for sampleName in sampleNames]]
                    else:
                        df = a.processed_data_set[list(sampleNames)]

                    sio = StringIO()
                    df.to_csv(sio, index_label='Probe ID', encoding='utf-8')
                    zf.writestr(
                        os.path.join(studyFolderName, "processed_expression_data.csv"),
                        sio.getvalue()
                    )

                # And include all other files that aren't covered by the above
                excludedFileNames = set([
                    a.investigation_file_name,
                    a.study_file_name,
                    a.assay_file_name,
                    a.processedDataFilename
                ])
                for filename in studyZf.namelist():
                    if filename not in excludedFileNames:
                        zf.writestr(
                            os.path.join(studyFolderName, filename),
                            studyZf.read(filename)
                        )

                print("Hello")

            #zf.write(studyArchivePath, arcname=studyFolderName + '.zip')

            # Progress update
            progress.update(float(studyNum+1) / len(studyAndSampleIds))

    progress.done()

except Exception as e:
    progress.error(str(e))
    raise   # Print stack trace to terminal and exit with a nonzero error code