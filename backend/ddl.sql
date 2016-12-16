DROP TABLE IF EXISTS uploads CASCADE ;
CREATE TABLE uploads (
   uuid UUID PRIMARY KEY
  ,createdOn TIMESTAMP DEFAULT(CURRENT_TIMESTAMP)
  ,status VARCHAR NOT NULL  -- Possible values: 'uploading', 'uploaded', 'ingesting', 'ingested'
);

DROP TABLE IF EXISTS downloads CASCADE ;
CREATE TABLE downloads (
   uuid UUID PRIMARY KEY
  ,createdOn TIMESTAMP DEFAULT(CURRENT_TIMESTAMP)
  ,status VARCHAR NOT NULL  -- Possible values: 'preparing', 'ready', 'error'
  ,progress REAL NOT NULL   -- Progress in completing download bundle (percentage in [0, 100])
  ,pid INTEGER NOT NULL DEFAULT(-1)
  ,errorString VARCHAR NOT NULL DEFAULT('')
);

DROP TABLE IF EXISTS dim_study CASCADE ;
CREATE TABLE dim_study (
   id SERIAL PRIMARY KEY
  ,name VARCHAR NOT NULL
  ,title VARCHAR NOT NULL
  ,extra_info JSONB NOT NULL
);

DROP TABLE IF EXISTS dim_sample CASCADE ;
CREATE TABLE dim_sample (
   id SERIAL PRIMARY KEY
  ,study_id INTEGER NOT NULL
  ,name VARCHAR NOT NULL
  ,control_sample_id INTEGER  -- Null if sample *is* the control
  ,extra_info JSONB NOT NULL

  ,FOREIGN KEY (study_id) REFERENCES dim_study (id)
  ,FOREIGN KEY (control_sample_id) REFERENCES dim_sample (id)
);

-- Allow multiple studies to share filenames
--DROP TABLE IF EXISTS file CASCADE ;
--CREATE TABLE file (
--   id SERIAL PRIMARY KEY
--  ,name VARCHAR
--);

DROP TABLE IF EXISTS dim_assay CASCADE ;
CREATE TABLE dim_assay (
  id SERIAL PRIMARY KEY
  ,sample_id INTEGER NOT NULL
--  ,raw_data_file_id INTEGER
--  ,processed_data_file_id INTEGER
--  ,annotations_file_id INTEGER
  ,extra_info JSONB NOT NULL

  ,UNIQUE(sample_id)   -- 1-1 relationship between samples and assays
  ,FOREIGN KEY (sample_id) REFERENCES dim_sample (id)
--  ,FOREIGN KEY (raw_data_file_id) REFERENCES dim_file (id)
--  ,FOREIGN KEY (processed_data_file_id) REFERENCES dim_file (id)
--  ,FOREIGN KEY (annotations_file_id) REFERENCES dim_file (id)
);

-- Annotations
DROP TABLE IF EXISTS dim_probe CASCADE ;
CREATE TABLE dim_probe (
   id SERIAL PRIMARY KEY
  --,file_id INTEGER NOT NULL
  ,name VARCHAR NOT NULL
  ,extra_info JSONB NOT NULL

  --,FOREIGN KEY (file_id) REFERENCES dim_file (id)
);

-- Raw data
DROP TABLE IF EXISTS fact_raw_datum CASCADE ;
CREATE TABLE fact_raw_datum (
   probe_id INTEGER NOT NULL
  ,sample_id INTEGER NOT NULL
  --,file_id INTEGER NOT NULL
  ,value NUMERIC

  ,PRIMARY KEY (probe_id, sample_id)
  ,FOREIGN KEY (probe_id) REFERENCES dim_probe (id)
  ,FOREIGN KEY (sample_id) REFERENCES dim_sample (id)
  --,FOREIGN KEY (file_id) REFERENCES dim_file (id)
);

-- Processed data
DROP TABLE IF EXISTS fact_processed_datum CASCADE ;
CREATE TABLE fact_processed_datum (
   probe_id INTEGER NOT NULL
  ,sample_id INTEGER NOT NULL
  --,file_id INTEGER NOT NULL
  ,value NUMERIC

  ,PRIMARY KEY (probe_id, sample_id)
  ,FOREIGN KEY (probe_id) REFERENCES dim_probe (id)
  ,FOREIGN KEY (sample_id) REFERENCES dim_sample (id)
  --,FOREIGN KEY (file_id) REFERENCES dim_file (id)
);

-- Metadata for metadata
DROP TABLE IF EXISTS dim_meta_meta CASCADE ;
CREATE TABLE dim_meta_meta (
   field_name VARCHAR PRIMARY KEY
  ,description VARCHAR NOT NULL
  ,category VARCHAR NOT NULL
  ,visibility VARCHAR NOT NULL
  ,data_type VARCHAR NOT NULL
  ,dimensions VARCHAR NOT NULL
  ,preferred_unit VARCHAR NOT NULL
  ,is_supplementary_file_name BOOLEAN NOT NULL
  ,name_in_sample_mini_summary VARCHAR NOT NULL
);

--INSERT INTO dim_meta_meta (field_name, description, category, visibility, data_type, dimensions, preferred_unit)
--VALUES ('Array or chip design', 'The design of the array or chip', 'Technical', 'main', 'string', 'none', 'none');

--INSERT INTO dim_meta_meta (field_name, description, category, visibility, data_type, dimensions, preferred_unit)
--VALUES ('Phase composition', 'Phase composition tooltip', 'Material > Physical', 'main', 'double', 'percentage', '%');

-- Authentication (for admins)
DROP TABLE IF EXISTS auth CASCADE;
CREATE TABLE auth (
  username VARCHAR PRIMARY KEY,
  salt VARCHAR NOT NULL,
  saltedHashedPassword VARCHAR NOT NULL,  -- SHA256(salt + pass).hexdigest()
  realname VARCHAR NOT NULL
);

-- Create default 'admin' user with password 'admin'
-- hashlib.sha256('12345' + 'admin').hexdigest() == 'a8e8f93dc9dfe306433c92589c82874cb9d7b2c7dc194d55907447bdcf794d6f'
INSERT INTO auth (username, salt, saltedHashedPassword, realname)
VALUES ('admin', '12345', 'a8e8f93dc9dfe306433c92589c82874cb9d7b2c7dc194d55907447bdcf794d6f', 'Administrator')