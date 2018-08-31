-- Cleanup potential old/unused tables
DROP TABLE IF EXISTS dim_study CASCADE ;
DROP TABLE IF EXISTS dim_sample CASCADE ;
DROP TABLE IF EXISTS dim_assay CASCADE ;
DROP TABLE IF EXISTS dim_probe CASCADE ;
DROP TABLE IF EXISTS dim_probe CASCADE ;
DROP TABLE IF EXISTS fact_processed_datum CASCADE ;

DROP TABLE IF EXISTS uploads CASCADE ;
CREATE TABLE uploads (
   uuid UUID PRIMARY KEY
  ,createdOn TIMESTAMP DEFAULT(CURRENT_TIMESTAMP)
  ,status VARCHAR NOT NULL  -- Possible values: 'uploading', 'uploaded', 'ingesting', 'ingested'
);

DROP TABLE IF EXISTS studies CASCADE ;
CREATE TABLE studies (
   uuid UUID PRIMARY KEY
  ,name VARCHAR NOT NULL
  ,type VARCHAR NOT NULL
  ,createdon TIMESTAMP NOT NULL
);

-- Metadata for tendons studies
DROP TABLE IF EXISTS tendons_metadata CASCADE ;
CREATE TABLE tendons_metadata (
   uuid UUID PRIMARY KEY
  ,arrayExpressId VARCHAR NOT NULL
  ,pubmedId VARCHAR
  ,name VARCHAR NOT NULL
  ,description VARCHAR NOT NULL
  ,geneExpressionType VARCHAR NOT NULL
  ,platform VARCHAR NOT NULL
  ,organism VARCHAR NOT NULL
  ,cellOrigin VARCHAR NOT NULL
  ,year NUMERIC NOT NULL
  ,sampleSize NUMERIC NOT NULL
  ,visible BOOLEAN NOT NULL
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