SELECT extra_info->'STUDY' FROM dim_study;
SELECT extra_info->>'Factor Value[Compound]' FROM dim_sample;

SELECT id FROM dim_sample
WHERE extra_info->>'Factor Value[Compound]' = 'dibutyryl-cAMP';

-- Select all interesting samples and their controls
WITH
  interestingSamples AS (
    SELECT id, control_sample_id FROM dim_sample
    WHERE extra_info->>'Factor Value[Compound]' = 'dibutyryl-cAMP'
  ),
  interestingSamplesAndControls AS (
    SELECT id FROM interestingSamples
    UNION ALL
    SELECT control_sample_id FROM interestingSamples WHERE control_sample_id IS NOT NULL
  )

SELECT *, s.extra_info->>'Characteristics[Sample Match]' AS controlName
FROM dim_sample s JOIN interestingSamplesAndControls ss ON s.id = ss.id
ORDER BY name
;


-- Fetch all processed data for interesting samples and controls
-- Include ancillary information about probes and samples
WITH
  interestingSamples AS (
    SELECT id, control_sample_id FROM dim_sample
    WHERE extra_info->>'Factor Value[Compound]' = 'dibutyryl-cAMP'
  ),
  interestingSamplesAndControls AS (
    SELECT id FROM interestingSamples
    UNION ALL
    SELECT control_sample_id FROM interestingSamples WHERE control_sample_id IS NOT NULL
  )

SELECT
  p.name                                                  AS probeName,
  p.extra_info->>'Symbol'                                 AS symbol,
  p.extra_info->>'Species'                                AS species,
  s.name                                                  AS sampleName,
  s.extra_info->>'Characteristics[Compound abbreviation]' AS compound,
  s.extra_info->>'Factor Value[Dose]'                     AS compoundDose_mM,
  d.value                                                 AS expressionLevel
FROM fact_processed_datum d
  join dim_probe p on d.probe_id = p.id
  join dim_sample s on d.sample_id = s.id
WHERE
  sample_id IN (SELECT * FROM interestingSamplesAndControls) AND
  p.extra_info->>'Symbol' = 'TP53'
ORDER BY probeName, sampleName
;

SELECT *
FROM dim_probe
WHERE extra_info->>'Symbol' = 'TP53';

SELECT extra_info->'STUDY PROTOCOLS'->'Study Protocol Description'->7
FROM dim_study s
WHERE id = 23
;