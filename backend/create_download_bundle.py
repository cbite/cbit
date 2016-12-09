#!/usr/bin/env python

import config.config as cfg
import psycopg2
import sys
import os
import json
import time
import zipfile
import re

INIT_PROGRESS = 10   # % progress represented just by kickstarting bundling process
MAX_FILENAME_LEN = 31

db_conn = psycopg2.connect(
    host=cfg.DB_HOST,
    port=cfg.DB_PORT,
    user=cfg.DB_USER,
    password=cfg.DB_PASS,
    database=cfg.DB_NAME
)

if len(sys.argv) != 2:
    sys.stderr.write("Usage: create_download_bundle.py <download_uuid>")
    raise SystemExit

download_uuid = sys.argv[1]
download_folder = os.path.join(cfg.DOWNLOADS_PATH, download_uuid)
with open(os.path.join(download_folder, 'config.json')) as f:
    download_config = json.load(f)

with db_conn.cursor() as cur:
    cur.execute("""
        UPDATE downloads
        SET
          progress = %s,
          pid = %s
        WHERE uuid = %s
    """, (INIT_PROGRESS, os.getpid(), download_uuid))
db_conn.commit()

# For now, just bundle the individual studies as they are, no sample subselection
studyAndSampleIds = download_config['targetData']
studyInfos = download_config['studyInfos']
existingNames = set()

zf = zipfile.ZipFile(os.path.join(download_folder, "download_bundle.zip"), "w", zipfile.ZIP_DEFLATED)
for (studyNum, studyId) in enumerate(download_config['targetData'].iterkeys()):
    studyArchivePath = os.path.join(cfg.FILES_PATH, studyId, 'archive.zip')
    studyTitle = studyInfos[studyId]['STUDY']['Study Title']
    origSafeStudyTitle = re.sub(r'[^a-zA-Z0-9\-_]', '', studyTitle) or "study"
    if len(origSafeStudyTitle) > MAX_FILENAME_LEN:
        safeStudyTitle = origSafeStudyTitle[:MAX_FILENAME_LEN-3] + '...'
    else:
        safeStudyTitle = origSafeStudyTitle

    i = 0
    tryName = safeStudyTitle
    while tryName in existingNames:
        i = i+1
        iStr = str(i)
        if len(origSafeStudyTitle) > (MAX_FILENAME_LEN - 1 - len(iStr) - 1):
            tryName = origSafeStudyTitle[:MAX_FILENAME_LEN-3 - 1 - len(iStr) - 1] + '...({0})'.format(iStr)
        else:
            tryName = origSafeStudyTitle + '({0})'.format(iStr)
    existingNames.add(tryName)

    zf.write(studyArchivePath, arcname=tryName + '.zip')

    # Progress update
    with db_conn.cursor() as cur:
        cur.execute("""
            UPDATE downloads
            SET
              progress = %s
            WHERE uuid = %s
        """, (INIT_PROGRESS + ((100. - INIT_PROGRESS) / 100) * (100 * float(studyNum+1) / len(studyAndSampleIds)), download_uuid))
    db_conn.commit()

zf.close()

with db_conn.cursor() as cur:
    cur.execute("""
        UPDATE downloads
        SET
          status = 'ready',
          progress = 100
        WHERE uuid = %s
    """, (download_uuid,))
db_conn.commit()