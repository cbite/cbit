/*
 NOTE: Sadly, all these unit conversions need to be duplicated in the
 Python backend and the TypeScript frontend.  Keep them in sync!
 */

export class UnitConverter {

  private _inCanonicalUnits: { [unitName: string]: number };
  private _normalizedInCanonicalUnits: { [unitName: string]: number };
  public canonicalUnit: string;

  /*
   unitsInCanonicalUnits is a dictionary from possible unit names to
   the equivalent quantity in canonical units.  The canonical unit
   should thus have a value of `1`.

   In case there is more than one name for the canonical unit, pass
   in the correct one in `canonicalUnit`
   */
  constructor(unitsInCanonicalUnits: { [unitName: string]: number }, canonicalUnit?: string) {

    this._inCanonicalUnits = unitsInCanonicalUnits;
    this._normalizedInCanonicalUnits = {};
    for (let unitName in this._inCanonicalUnits) {
      this._normalizedInCanonicalUnits[this.normalizeUnitName(unitName)] = this._inCanonicalUnits[unitName];
    }

    if (canonicalUnit) {
      if (!(canonicalUnit in this._inCanonicalUnits)) {
        throw new Error("`canonicalUnit` not present in `unitsInCanonicalUnits`");
      } else {
        this.canonicalUnit = canonicalUnit;
      }
    } else {
      this.canonicalUnit = null;
      for (let unitStr in this._inCanonicalUnits) {
        if (this._inCanonicalUnits[unitStr] === 1) {
          if (!this.canonicalUnit) {
            this.canonicalUnit = unitStr;
          } else {
            throw new Error(`Ambiguous canonical unit (could be ${this.canonicalUnit} or ${unitStr}).  ` +
              "Pass in a disamibiguating choice in `canonicalUnit`");
          }
        }
      }
      if (!this.canonicalUnit) {
        throw new Error("No canonical unit present in `unitsInCanonicalUnits`!");
      }
    }
  }

  normalizeUnitName(unitString: string): string {
    return unitString.toLowerCase().replace(" ", "");
  }

  isValidUnit(unitString: string): boolean {
    return this.normalizeUnitName(unitString) in this._normalizedInCanonicalUnits;
  }

  toCanonicalUnit(value: number, valueUnitStr: string) {
    return value * this._normalizedInCanonicalUnits[this.normalizeUnitName(valueUnitStr)];
  }

  getPossibleUnits(): string[] {
    // Return units in order of largest to smallest unit
    return Object.keys(this._inCanonicalUnits)
      .sort((a: string, b: string) => -(this._inCanonicalUnits[a] - this._inCanonicalUnits[b]));
  }

  fromCanonicalUnits(valueInCanonicalUnits: number, targetUnitStr: string): number {
    return valueInCanonicalUnits / this._normalizedInCanonicalUnits[this.normalizeUnitName(targetUnitStr)];
  }
}



// Unit conversions accept all relevant units from this ontology:
// https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000

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
