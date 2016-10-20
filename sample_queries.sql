SELECT extra_info->'STUDY' FROM dim_study;


SELECT id FROM dim_sample
WHERE extra_info->>'Factor Value[Compound]' = 'dibutyryl-cAMP';

WITH
  interestingSamples AS (
    SELECT id, name, extra_info->>'Characteristics[Sample Match]' controlName FROM dim_sample
    WHERE extra_info->>'Factor Value[Compound]' = 'dibutyryl-cAMP'
  )
  , interestingSamplesAndControls AS (
    SELECT id
    FROM interestingSamples

    UNION ALL

    SELECT control.id
    FROM dim_sample control join interestingSamples s
      on control.name = s.controlName
  )

--SELECT *, s.extra_info->>'Characteristics[Sample Match]' AS controlName
--FROM dim_sample s JOIN interestingSamplesAndControls ss ON s.id = ss.id
--ORDER BY name
--;

SELECT
  p.name                   AS probeName,
  p.extra_info->>'Symbol'  AS symbol,
  p.extra_info->>'Species' AS species,
  s.name                   AS sampleName,
  s.extra_info->>'Characteristics[Compound abbreviation]' AS compound,
  s.extra_info->>'Factor Value[Dose]' AS compoundDose_mM,
  d.value                  AS expressionLevel
FROM fact_processed_datum d
  join dim_probe p on d.probe_id = p.id
  join dim_sample s on d.sample_id = s.id
WHERE sample_id IN (SELECT * FROM interestingSamplesAndControls)
ORDER BY probeName, sampleName
;

SELECT extra_info->>'Factor Value[Compound]' FROM dim_sample;