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

export function reduceToItems(data: PieChartData, max: number, countsArray: number[]): any {
  if (data.labels.length > max) {
    const mergeItemCount = data.labels.length - (max - 1);
    const itemsToMerge = [].concat(countsArray).sort().slice(0, mergeItemCount);
    let otherCount = 0;
    const result = {labels: [].concat(data.labels), counts: [].concat(countsArray)};

    for (let i = 0; i < itemsToMerge.length; i++) {
      const index = result.counts.indexOf(itemsToMerge[i]);
      if (index !== -1) {
        otherCount += countsArray[index];
        result.counts.splice(index, index + 1);
        result.labels.splice(index, index + 1);
      }
    }
    result.labels.push('others');
    result.counts.push(otherCount);
    return result;
  } else {
    console.log('check2');
    return {labels: data.labels, counts: countsArray};
  }
}
