import {Injectable} from "@angular/core";
import {FieldMeta} from "../common/field-meta.model";
import {DimensionsRegister} from "../common/unit-conversions";

@Injectable()
export class UnitFormattingService {

  formatValue(val: (string | number), fieldMeta: FieldMeta, valueRanges: {[fieldName: string]: number}, targetUnit?: string) {
    targetUnit = targetUnit || fieldMeta.preferredUnit;

    let unitConverter = DimensionsRegister[fieldMeta.dimensions];
    let convert: (val: any) => string;
    let unitUIName: string;
    if (fieldMeta.dimensions == 'none' || !unitConverter) {
      convert = (x: any) => x + '';
      unitUIName = '';
    } else {

      let rawConvert = (x: any) => unitConverter.fromCanonicalUnits(+x, targetUnit);

      // Convert numbers with enough precision to distinguish a change of size that's 1/100th of the range of value
      // But whatever happens, always output 0 as 0, not something like 0.000
      let tickSize = (valueRanges[fieldMeta.fieldName] || 1) / 100;
      let tickSizeInChosenUnits = rawConvert(tickSize) - rawConvert(0);
      let fixedDigits = Math.max(0, Math.min(20, -Math.floor(Math.log10(tickSizeInChosenUnits))));
      convert = (x: any) => (x === 0.0 ? "0" : rawConvert(x).toFixed(fixedDigits));

      unitUIName = unitConverter.getUnitUIName(targetUnit);
    }

    switch (fieldMeta.fieldName) {
      case 'Phase composition':
        return this.decodePhaseCompositionLike(''+val, (component, percentage) => `${convert(percentage)}${unitUIName} ${component}`);
      case 'Elements composition':
        return this.decodePhaseCompositionLike(''+val, (element, percentage) => `${convert(percentage)}${unitUIName} ${element}`);
      case 'Wettability':
        return this.decodePhaseCompositionLike(''+val, (liquid, contactAngle) => `${convert(contactAngle)}${unitUIName} with ${liquid}`);
      default:
        return `${convert(val)} ${unitUIName}`;
    }
  }

  decodePhaseCompositionLike(s: string, entryFormatter: (component: string, value: number) => string): string {
    try {
      var results: Array<string> = [];
      for (let entry of s.split(';')) {
        var
          fields = entry.split('='),
          component = fields[0],
          percentage = parseFloat(fields[1]);
        results.push(entryFormatter(component, percentage));
      }
      return results.join(', ');
    } catch(e) {
      return s;
    }
  }

}
