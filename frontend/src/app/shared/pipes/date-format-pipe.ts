import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'dateFormatPipe'})
export class DateFormatPipe implements PipeTransform {

  constructor() {}

  transform(value: string): string {
    return moment(value, 'YYYY-MM-DD').format('DD MMMM YYYY');
  }
}
