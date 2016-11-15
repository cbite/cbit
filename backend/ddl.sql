DROP TABLE IF EXISTS uploads CASCADE ;
CREATE TABLE uploads (
   uuid UUID PRIMARY KEY
  ,createdOn TIMESTAMP DEFAULT(CURRENT_TIMESTAMP)
  ,status VARCHAR NOT NULL  -- Possible values: 'uploading', 'uploaded', 'ingesting', 'ingested'
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
