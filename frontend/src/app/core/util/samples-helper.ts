import {Sample} from '../types/study.model';

export function getCommonKeys(samples: Sample[]): any {
  const commonKeys = {};
  if (samples.length > 0) {
    const firstSample = samples[0];

    for (const key in firstSample._source) {
      if (key.substr(0, 1) !== '*') {
        commonKeys[key] = firstSample._source[key];
      }
    }

    for (const sample of samples) {
      for (const commonKey in commonKeys) {
        if (!(commonKey in sample._source) ||
          (sample._source[commonKey] !== commonKeys[commonKey])) {
          delete commonKeys[commonKey];
        }
      }
    }
  }
  return commonKeys;
}
