import {BarChartData} from './bar-chart.data';

export function prepareBarChartData(data: any, propertyName: string): BarChartData {
  const bioMaterialStudiesByGeneExpression = data.filter(st => st.type === 'Biomaterial').reduce((result, study) => {
    if (result[study[propertyName]]) {
      result[study[propertyName]].push(study);
    } else {
      result[study[propertyName]] = [study];
    }
    return result;
  }, {});

  const tendonsStudiesByGeneExpression = data.filter(st => st.type === 'Tendons').reduce((result, study) => {
    if (result[study[propertyName]]) {
      result[study[propertyName]].push(study);
    } else {
      result[study[propertyName]] = [study];
    }
    return result;
  }, {});

  const uniqueLabels = new Set(Object.getOwnPropertyNames(bioMaterialStudiesByGeneExpression)
    .concat(Object.getOwnPropertyNames(tendonsStudiesByGeneExpression)));
  const labels = Array.from(uniqueLabels);
  console.log(labels);
  const studiesCounts = [];
  studiesCounts[0] = labels.map(l => bioMaterialStudiesByGeneExpression[l] ? bioMaterialStudiesByGeneExpression[l].length : 0);
  studiesCounts[1] = labels.map(l => tendonsStudiesByGeneExpression[l] ? tendonsStudiesByGeneExpression[l].length : 0);

  return new BarChartData(labels, studiesCounts);
}
