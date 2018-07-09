import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'splitByThreePipe'})
export class SplitByThreePipe implements PipeTransform {

  constructor() {}

  transform(values: any[]): any[][] {
    const result = [];
    let row = [];
    for (let i = 0; i < values.length; i++) {
      if ((i) % 3 === 0) {
        result.push(row);
        row = [];
      }

      row.push(values[i]);

      if (i === (values.length - 1 )) {
        result.push(row);
      }
    }
    return result;
  }
}
