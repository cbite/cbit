import {PieChartData} from './pie-chart.data';

export function preparePieChartData(data: any, propertyName: string): PieChartData {
  const samplesIds = Object.getOwnPropertyNames(data.samplesData);
  const samplesByMaterialClass = samplesIds.map(id => data.samplesData[id]).reduce((result, sample) => {
    if (result[sample[propertyName]]) {
      result[sample[propertyName]].push(sample);
    } else {
      result[sample[propertyName]] = [sample];
    }
    return result;
  }, {});

  const studiesByMaterialClass = {};
  Object.getOwnPropertyNames(samplesByMaterialClass).map((name) => {
    const allSamples = samplesByMaterialClass[name];
    studiesByMaterialClass[name] = allSamples.map(sample => sample.studyId).filter((v, i, a) => a.indexOf(v) === i);
  });

  const materialClassLabels = Object.getOwnPropertyNames(samplesByMaterialClass);
  const studiesCounts = Object.getOwnPropertyNames(studiesByMaterialClass).map(dp => studiesByMaterialClass[dp].length);
  const samplesCounts = Object.getOwnPropertyNames(samplesByMaterialClass).map(dp => samplesByMaterialClass[dp].length);

  return new PieChartData(materialClassLabels, samplesCounts, studiesCounts, samplesByMaterialClass);
}
