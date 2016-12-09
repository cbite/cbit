#!/usr/bin/env python

import config.config as cfg
import psycopg2
import sys
import os
import json
import time
import zipfile

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

print json.dumps(download_config, indent=2, sort_keys=True)

with db_conn.cursor() as cur:
    cur.execute("""
        UPDATE downloads
        SET
          pid = %s
        WHERE uuid = %s
    """, (os.getpid(), download_uuid))
db_conn.commit()

# Make a test archive with not much in it
testFilePath = os.path.join(download_folder, "test.txt")
with open(testFilePath, 'w') as f:
    f.write("This is a test of the emergency broadcast system")

zf = zipfile.ZipFile(os.path.join(download_folder, "download_bundle.zip"), "w", zipfile.ZIP_DEFLATED)
zf.write(testFilePath, arcname="test.txt")
zf.close()

#        # Get study title to make friendly filename
#        studyTitle = results['_source']['STUDY']['Study Title']
#        safeStudyTitle = re.sub(r'[^a-zA-Z0-9\-_]', '', studyTitle) or "study"



if False:
    for i in range(0, 100+10, 10):
        with db_conn.cursor() as cur:
            cur.execute("""
                UPDATE downloads
                SET
                  progress = %s
                WHERE uuid = %s
            """, (i, download_uuid))
        db_conn.commit()
        time.sleep(1)

with db_conn.cursor() as cur:
    cur.execute("""
        UPDATE downloads
        SET
          status = 'ready',
          progress = 100
        WHERE uuid = %s
    """, (download_uuid,))
db_conn.commit()