/*
 NOTE: Sadly, all these unit conversions need to be duplicated in the
 Python backend and the TypeScript frontend.  Keep them in sync!

 Unit conversions accept all relevant units from this ontology:
 https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000
 */

interface SingleUnitConverter {
  toCanonical:   (valueInThisUnit: number) => number,
  fromCanonical: (valueInCanonicalUnits: number) => number,
  sortingKey:    number,
  isCanonical:   boolean
};

export class UnitConverter {

  private _unitConverters:           { [unitName: string]: SingleUnitConverter };
  private _normalizedUnitConverters: { [unitName: string]: SingleUnitConverter };
  private _possibleUnits: string[];  // Cached to avoid creating duplicate objects that trigger Angular2's change detection
  public canonicalUnit: string;

  /*
   unitsInCanonicalUnits is a dictionary from possible unit names to
   the equivalent quantity in canonical units.  The canonical unit
   should thus have a value of `1`.

   Exceptionally, the values of the dictionary can also be a dictionary
   of two functions, keyed by 'toCanonical' and 'fromCanonical', which
   convert values in the given unit to the canonical units and vice versa.

   In case there is more than one name for the canonical unit, pass
   in the correct one in `canonicalUnit`
   */
  constructor(unitsInCanonicalUnits: { [unitName: string]: (number | SingleUnitConverter) }, canonicalUnit?: string) {

    /* Type-checking code from Python unnecessary in TypeScript */

    this._unitConverters = {}
    for (let unitName in unitsInCanonicalUnits) {
      let v = unitsInCanonicalUnits[unitName];
      if (typeof v === "number") {
        this._unitConverters[unitName] = this.makeSimpleSingleUnitConverter(v);
      } else {
        this._unitConverters[unitName] = v;
      }
    }

    this._normalizedUnitConverters = {};
    for (let unitName in this._unitConverters) {
      this._normalizedUnitConverters[this.normalizeUnitName(unitName)] = this._unitConverters[unitName];
    }

    if (canonicalUnit) {
      if (!(canonicalUnit in this._unitConverters)) {
        throw new Error("`canonicalUnit` not present in `unitsInCanonicalUnits`");
      } else {
        this.canonicalUnit = canonicalUnit;
      }
    } else {
      this.canonicalUnit = null;
      for (let unitName in this._unitConverters) {
        if (this._unitConverters[unitName].isCanonical) {
          if (!this.canonicalUnit) {
            this.canonicalUnit = unitName;
          } else {
            throw new Error(`Ambiguous canonical unit (could be ${this.canonicalUnit} or ${unitName}).  ` +
              "Pass in a disamibiguating choice in `canonicalUnit`");
          }
        }
      }
      if (!this.canonicalUnit) {
        throw new Error("No canonical unit present in `unitsInCanonicalUnits`!");
      }
    }

    // Order units in order of largest to smallest unit
    this._possibleUnits =
      Object.keys(this._unitConverters)
        .sort((a: string, b: string) => -(this._unitConverters[a].sortingKey - this._unitConverters[b].sortingKey));
  }

  private makeSimpleSingleUnitConverter(unitInCanonicalUnits: number): SingleUnitConverter {
    return {
      toCanonical:   (valueInThisUnit: number) => (valueInThisUnit * unitInCanonicalUnits),
      fromCanonical: (valueInCanonicalUnits: number) => (valueInCanonicalUnits / unitInCanonicalUnits),
      sortingKey:    unitInCanonicalUnits,
      isCanonical:   unitInCanonicalUnits === 1
    };
  }

  normalizeUnitName(unitString: string): string {
    return unitString.toLowerCase().replace(" ", "");
  }

  isValidUnit(unitString: string): boolean {
    return this.normalizeUnitName(unitString) in this._normalizedUnitConverters;
  }

  toCanonicalUnit(value: number, valueUnitStr: string): number {
    return this._normalizedUnitConverters[this.normalizeUnitName(valueUnitStr)].toCanonical(value);
  }

  getPossibleUnits(): string[] {
    return this._possibleUnits;
  }

  fromCanonicalUnits(valueInCanonicalUnits: number, targetUnitStr: string): number {
    return this._normalizedUnitConverters[this.normalizeUnitName(targetUnitStr)].fromCanonical(valueInCanonicalUnits);
  }
}



// Unit conversions accept all relevant units from this ontology:
// https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000


// Special converter that does nothing
export const NoneConverter = new UnitConverter({
  'none': 1.
});


// unit -> time unit
// Canonical unit: hours
export const TimeUnitConverter = new UnitConverter({
  'century':     100 * 365 * 24,
  'year':        365 * 24,
  'month':       (365. / 12.) * 24,   // approximate
  'week':        7 * 24,
  'day':         24,
  'hour':        1,
  'minute':      1 / 60.0,
  'second':      1 / 60.0 / 60.0,
  'millisecond': 1 / 1000. / 60. / 60.,
  'microsecond': 1 / 1000000. / 60. / 60.,
  'nanosecond':  1 / 1000000000. / 60. / 60.,
  'picosecond':  1 / 1000000000000. / 60. / 60.,
});


// unit -> concentration unit -> unit of molarity
// Canonical unit: mM
export const ConcentrationUnitConverter = new UnitConverter({
  'molar':      1000.0,
  'millimolar': 1,
  'micromolar': 1 / 1000.0,
  'nanomolar':  1 / 1000000.0,
  'picomolar':  1 / 1000000000.0,
  'femtomolar': 1 / 1000000000000.0,
});


// unit -> mass unit, excluding unit -> mass unit -> molar mass unit
// Canonical unit: g
const nAvogadro = 6.022140857e23;    // http://physics.nist.gov/cgi-bin/cuu/Value?na
const daltonInG = 12.0 / nAvogadro;  // nAvogadro atoms of 12C have a mass of exactly 12g

export const MassUnitConverter = new UnitConverter({
  'kilogram':   1000,
  'gram':       1,
  'milligram':  1 / 1000.,
  'microgram':  1 / 1000000.,
  'nanogram':   1 / 1000000000.,
  'picogram':   1 / 1000000000000.,
  'femtogram':  1 / 1000000000000000.,

  'dalton':     daltonInG,
  'kilodalton': 1000 * daltonInG,
});

// unit -> area unit
// Canonical unit: m^2
export const AreaUnitConverter = new UnitConverter({
  'square meter':      1,
  'square centimeter': 1 / (100. ** 2),
  'square millimeter': 1 / (1000. ** 2),
  'square angstrom':   1 / (10000000000. ** 2),
});


// Special-purpose unit for cBiT
// % / [length unit]
// Canonical unit: % / week
export const WeightLossUnitConverter = new UnitConverter({
  '% / century':     (1. / (100 * 365 * 24)) / (1. / (7 * 24)),
  '% / year':        (1. / (365 * 24)) / (1. / (7 * 24)),
  '% / month':       (1. / ((365. / 12.) * 24)) / (1. / (7 * 24)),  // approximate
  '% / week':        1,   // (1. / (7 * 24)) / (1. / (7 * 24)),
  '% / day':         (1. / (24)) / (1. / (7 * 24)),
  '% / hour':        (1. / (1)) / (1. / (7 * 24)),
  '% / minute':      (1. / (1 / 60.0)) / (1. / (7 * 24)),
  '% / second':      (1. / (1 / 60.0 / 60.0)) / (1. / (7 * 24)),
  '% / millisecond': (1. / (1 / 1000. / 60. / 60.)) / (1. / (7 * 24)),
  '% / microsecond': (1. / (1 / 1000000. / 60. / 60.)) / (1. / (7 * 24)),
  '% / nanosecond':  (1. / (1 / 1000000000. / 60. / 60.)) / (1. / (7 * 24)),
  '% / picosecond':  (1. / (1 / 1000000000000. / 60. / 60.)) / (1. / (7 * 24)),
});

// unit -> length unit, excluding centiMorgan, centiRay
// Canonical unit: m
export const LengthUnitConverter = new UnitConverter({
  'meter':      1.,
  'centimeter': 1. / 100.,
  'millimeter': 1. / 1000.,
  'micrometer': 1. / 1000000.,
  'nanometer':  1. / 1000000000.,
  'angstrom':   1. / 10000000000.,
  'picometer':  1. / 1000000000000.,
});

// unit -> pressure unit
// Canonical unit: pascal
export const PressureConverter = new UnitConverter({
  'pascal':                 1.,
  'millimeters of mercury': 133.322387415  // https://en.wikipedia.org/wiki/Millimeter_of_mercury
});


// unit -> angle unit -> plane angle unit
// Canonical unit: degree
export const AngleConverter = new UnitConverter({
  'degree': 1.,
  'radian': 360. / (2 * Math.PI)
});


// Special-purpose unit for cBiT
// NOTE: the ontology units for percent are useless!  I've removed them
// Canonical unit: %
export const PercentageConverter = new UnitConverter({
  '%':       1.,
});


// unit -> dimensionless unit -> parts per notation unit
// Canonical unit: parts per million
export const PartsPerConverter = new UnitConverter({
  'parts per hundred':       10000.,   // this is just a percentage: should we merge 'percentage' and 'parts_per' dimensions?
  'parts per thousand':      1000.,
  'parts per million':       1.,
  'parts per billion':       1. / 1000.,
  'parts per trillion':      1. / 1000000.,
  'parts per quadrillion':   1. / 1000000000.,
});


// unit -> temperature unit
// Canonical unit: degree Celsius
// NOTE: Have to go to the extra mile to support temperature conversions
// that aren't simply scaling factors
export const TemperatureConverter = new UnitConverter({
  'kelvin':         1.,
  'degree Celsius': {
    toCanonical:   (TinC: number) => (TinC - 273.15),
    fromCanonical: (TinK: number) => (TinK + 273.15),
    sortingKey:    10.,   // Larger values sort earlier
    isCanonical:   false
  },
  'degree Fahrenheit':{
    toCanonical:   (TinF: number) => ((TinF - 32) * 5./9. - 273.15),
    fromCanonical: (TinK: number) => ((TinK + 273.15) * 9./5. + 32),
    sortingKey:    5.,    // Larger values sort earlier
    isCanonical:   false
  },
});


// unit -> electric potential difference unit
// Canonical unit: volt
export const ElectricPotentialDifferenceConverter = new UnitConverter({
  'megavolt':  1e6,
  'kilovolt':  1e3,
  'volt':      1.,
  'millivolt': 1e-3,
  'microvolt': 1e-6,
  'nanovolt':  1e-9,
  'picovolt':  1e-12,
});


// Global register of dimensions
export const DimensionsRegister: {[dimensions: string]: UnitConverter} = {
  'none':                           NoneConverter,
  'time':                           TimeUnitConverter,
  'concentration':                  ConcentrationUnitConverter,
  'mass':                           MassUnitConverter,
  'area':                           AreaUnitConverter,
  'weight_loss':                    WeightLossUnitConverter,
  'length':                         LengthUnitConverter,
  'pressure':                       PressureConverter,
  'angle':                          AngleConverter,
  'percentage':                     PercentageConverter,
  'parts_per':                      PartsPerConverter,
  'temperature':                    TemperatureConverter,
  'electric_potential_difference':  ElectricPotentialDifferenceConverter,
};

// Rogue value to signal that a field is unitful but that the units are not recognized
export const INVALID_DIMENSIONS = 'invalid';
