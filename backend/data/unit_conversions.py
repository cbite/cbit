# NOTE: Sadly, all these unit conversions need to be duplicated in the
# Python backend and the TypeScript frontend.  Keep them in sync!

class UnitConverter(object):
    def __init__(self, unitsInCanonicalUnits, canonicalUnit=None):
        """
        unitsInCanonicalUnits is a dictionary from possible unit names to
        the equivalent quantity in canonical units.  The canonical unit
        should thus have a value of `1`.

        In case there is more than one name for the canonical unit, pass
        in the correct one in `canonicalUnit`
        """
        self._inCanonicalUnits = unitsInCanonicalUnits

        self._normalizedInCanonicalUnits = {
            self.normalizeUnitName(unitName): inCanonicalUnits
            for unitName, inCanonicalUnits in self._inCanonicalUnits.iteritems()
        }

        if canonicalUnit:

            if canonicalUnit not in self._inCanonicalUnits:
                raise ValueError("`canonicalUnit` not present in `unitsInCanonicalUnits`")
            self.canonicalUnit = canonicalUnit

        else:

            self.canonicalUnit = None
            for unitStr, inCanonicalUnits in self._inCanonicalUnits.iteritems():
                if inCanonicalUnits == 1.0:
                    if not self.canonicalUnit:
                        self.canonicalUnit = unitStr
                    else:
                        raise ValueError("Ambiguous canonical unit (could be {0} or {1}).  Pass in a disamibiguating choice in `canonicalUnit`"
                                         .format(self.canonicalUnit, unitStr))
            if not self.canonicalUnit:
                raise ValueError("No canonical unit present in `unitsInCanonicalUnits`!")

    def normalizeUnitName(self, unitString):
        return unitString.lower().replace(' ','')

    def isValidUnit(self, unitString):
        return self.normalizeUnitName(unitString) in self._normalizedInCanonicalUnits

    def toCanonicalUnit(self, value, valueUnitStr):
        return value * self._normalizedInCanonicalUnits[self.normalizeUnitName(valueUnitStr)]

    def getPossibleUnits(self):
        # Return units in order of largest to smallest unit
        return sorted(list(set(self._inCanonicalUnits.keys())),
                      lambda a, b: -(self._inCanonicalUnits[a] - self._inCanonicalUnits[b]))

    def fromCanonicalUnits(self, valueInCanonicalUnits, targetUnitStr):
        return valueInCanonicalUnits / float(self._normalizedInCanonicalUnits[self.normalizeUnitName(targetUnitStr)])


# Unit conversions accept all relevant units from this ontology:
# https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000

# unit -> time unit
# Canonical unit: hours
TimeUnitConverter = UnitConverter({
    'century':     100 * 365 * 24,
    'year':        365 * 24,
    'month':       (365. / 12.) * 24,   # approximate
    'week':        7 * 24,
    'day':         24,
    'hour':        1,
    'minute':      1 / 60.0,
    'second':      1 / 60.0 / 60.0,
    'millisecond': 1 / 1000. / 60. / 60.,
    'microsecond': 1 / 1000000. / 60. / 60.,
    'nanosecond':  1 / 1000000000. / 60. / 60.,
    'picosecond':  1 / 1000000000000. / 60. / 60.,
})


# unit -> concentration unit -> unit of molarity
# Canonical unit: mM
ConcentrationUnitConverter = UnitConverter({
    'molar':      1000.0,
    'millimolar': 1,
    'micromolar': 1 / 1000.0,
    'nanomolar':  1 / 1000000.0,
    'picomolar':  1 / 1000000000.0,
    'femtomolar': 1 / 1000000000000.0,
})


# unit -> mass unit, excluding unit -> mass unit -> molar mass unit
# Canonical unit: g
nAvogadro = 6.022140857e23  # http://physics.nist.gov/cgi-bin/cuu/Value?na
daltonInG = 12.0 / nAvogadro  # nAvogadro atoms of 12C have a mass of exactly 12g

MassUnitConverter = UnitConverter({
    'kilogram':   1000,
    'gram':       1,
    'milligram':  1 / 1000.,
    'microgram':  1 / 1000000.,
    'nanogram':   1 / 1000000000.,
    'picogram':   1 / 1000000000000.,
    'femtogram':  1 / 1000000000000000.,

    'dalton':     daltonInG,
    'kilodalton': 1000 * daltonInG,
})

# unit -> area unit
# Canonical unit: m^2
AreaUnitConverter = UnitConverter({
    'square meter':      1,
    'square centimeter': 1 / (100. ** 2),
    'square millimeter': 1 / (1000. ** 2),
    'square angstrom':   1 / (10000000000. ** 2),
})


# % / [length unit]
# Canonical unit: % / week
WeightLossUnitConverter = UnitConverter({
    '% / century':     (1. / (100 * 365 * 24)) / (1. / (7 * 24)),
    '% / year':        (1. / (365 * 24)) / (1. / (7 * 24)),
    '% / month':       (1. / ((365. / 12.) * 24)) / (1. / (7 * 24)),  # approximate
    '% / week':        1,   # (1. / (7 * 24)) / (1. / (7 * 24)),
    '% / day':         (1. / (24)) / (1. / (7 * 24)),
    '% / hour':        (1. / (1)) / (1. / (7 * 24)),
    '% / minute':      (1. / (1 / 60.0)) / (1. / (7 * 24)),
    '% / second':      (1. / (1 / 60.0 / 60.0)) / (1. / (7 * 24)),
    '% / millisecond': (1. / (1 / 1000. / 60. / 60.)) / (1. / (7 * 24)),
    '% / microsecond': (1. / (1 / 1000000. / 60. / 60.)) / (1. / (7 * 24)),
    '% / nanosecond':  (1. / (1 / 1000000000. / 60. / 60.)) / (1. / (7 * 24)),
    '% / picosecond':  (1. / (1 / 1000000000000. / 60. / 60.)) / (1. / (7 * 24)),
})

# unit -> length unit, excluding centiMorgan, centiRay
# Canonical unit: m
LengthUnitConverter = UnitConverter({
    'meter':      1.,
    'centimeter': 1. / 100.,
    'millimeter': 1. / 1000.,
    'micrometer': 1. / 1000000.,
    'nanometer':  1. / 1000000000.,
    'angstrom':   1. / 10000000000.,
    'picometer':  1. / 1000000000000.,
})
