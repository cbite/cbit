# NOTE: Sadly, all these unit conversions need to be duplicated in the
# Python backend and the TypeScript frontend.  Keep them in sync!
#
# Unit conversions accept all relevant units from this ontology:
# https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000

import math


class SingleUnitConverter(object):
    def __init__(self, fromCanonical, toCanonical, sortingKey, isCanonical=False):

        if not callable(fromCanonical):
            raise ValueError('`fromCanonical` is not callable')
        if not callable(toCanonical):
            raise ValueError('`toCanonical` is not callable')

        self.fromCanonical = fromCanonical
        self.toCanonical = toCanonical
        self.sortingKey = sortingKey
        self.isCanonical = isCanonical


class UnitConverter(object):
    def __init__(self, unitsInCanonicalUnits, canonicalUnit=None):
        """
        unitsInCanonicalUnits is a dictionary from possible unit names to
        the equivalent quantity in canonical units.  The canonical unit
        should thus have a value of `1`.

        For more complicated conversions, the value in the dictionary should
        be an instance of SingleUnitConverter.

        In case there is more than one name for the canonical unit, pass
        in the correct one in `canonicalUnit`
        """

        self._unitConverters = {
            k: (v if isinstance(v, SingleUnitConverter)
                else self._makeSimpleSingleUnitConverter(v))
            for k, v in unitsInCanonicalUnits.iteritems()
        }

        self._normalizedUnitConverters = {
            self.normalizeUnitName(unitName): unitConverter
            for unitName, unitConverter in self._unitConverters.iteritems()
        }

        if canonicalUnit:

            if canonicalUnit not in self._unitConverters:
                raise ValueError("`canonicalUnit` not present in `unitsInCanonicalUnits`")
            self.canonicalUnit = canonicalUnit

        else:

            self.canonicalUnit = None
            for unitName, unitConverter in self._unitConverters.iteritems():
                if unitConverter.isCanonical:
                    if not self.canonicalUnit:
                        self.canonicalUnit = unitName
                    else:
                        raise ValueError("Ambiguous canonical unit (could be {0} or {1}).  Pass in a disamibiguating choice in `canonicalUnit`"
                                         .format(self.canonicalUnit, unitName))
            if not self.canonicalUnit:
                raise ValueError("No canonical unit present in `unitsInCanonicalUnits`!")

    def _makeSimpleSingleUnitConverter(self, unitInCanonicalUnits):
        return SingleUnitConverter(
            toCanonical=(lambda valueInThisUnit: valueInThisUnit * unitInCanonicalUnits),
            fromCanonical=(lambda valueInCanonicalUnits: valueInCanonicalUnits / unitInCanonicalUnits),
            sortingKey=unitInCanonicalUnits,
            isCanonical=(unitInCanonicalUnits == 1)
        )

    def normalizeUnitName(self, unitString):
        return unitString.lower().replace(' ','')

    def isValidUnit(self, unitString):
        return self.normalizeUnitName(unitString) in self._normalizedUnitConverters

    def toCanonicalUnit(self, value, valueUnitStr):
        return self._normalizedUnitConverters[self.normalizeUnitName(valueUnitStr)].toCanonical(value)

    def getPossibleUnits(self):
        # Return units in order of largest to smallest unit
        return sorted(list(set(self._unitConverters.keys())),
                      key=lambda unitName: self._unitConverters[unitName].sortingKey,
                      reverse=True)

    def fromCanonicalUnits(self, valueInCanonicalUnits, targetUnitStr):
        return self._normalizedUnitConverters[self.normalizeUnitName(targetUnitStr)].fromCanonical(valueInCanonicalUnits)


# Unit conversions accept all relevant units from this ontology:
# https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000

# Special converter that does nothing
NoneConverter = UnitConverter({
    'none': 1.
})

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


# Special-purpose unit for cBiT
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


# unit -> pressure unit
# Canonical unit: pascal
PressureConverter = UnitConverter({
    'pascal':                 1.,
    'millimeters of mercury': 133.322387415  # https://en.wikipedia.org/wiki/Millimeter_of_mercury
})


# unit -> angle unit -> plane angle unit
# Canonical unit: degree
AngleConverter = UnitConverter({
    'degree': 1.,
    'radian': 360. / (2 * math.pi)
})


# Special-purpose unit for cBiT
# NOTE: the ontology units for percent are useless!  I've removed them
# Canonical unit: %
PercentageConverter = UnitConverter({
    '%':       1.,
})


# unit -> dimensionless unit -> parts per notation unit
# Canonical unit: parts per million
PartsPerConverter = UnitConverter({
    'parts per hundred':       10000.,   # this is just a percentage: should we merge 'percentage' and 'parts_per' dimensions?
    'parts per thousand':      1000.,
    'parts per million':       1.,
    'parts per billion':       1. / 1000.,
    'parts per trillion':      1. / 1000000.,
    'parts per quadrillion':   1. / 1000000000.,
})


# unit -> temperature unit
# Canonical unit: degree Celsius
# NOTE: Have to go to the extra mile to support temperature conversions
# that aren't simply scaling factors
TemperatureConverter = UnitConverter({
    'kelvin':            1.,
    'degree Celsius':    SingleUnitConverter(
        toCanonical =   (lambda TinC: TinC - 273.15),
        fromCanonical = (lambda TinK: TinK + 273.15),
        sortingKey =    10.,   # Larger values sort earlier
        isCanonical =   False
    ),
    'degree Fahrenheit': SingleUnitConverter(
        toCanonical =   (lambda TinF: (TinF - 32) * 5./9. - 273.15),
        fromCanonical = (lambda TinK: (TinK + 273.15) * 9./5. + 32),
        sortingKey =    5.,    # Larger values sort earlier
        isCanonical =   False
    )
})


# unit -> electric potential difference unit
# Canonical unit: volt
ElectricPotentialDifferenceConverter = UnitConverter({
    'megavolt':  1e6,
    'kilovolt':  1e3,
    'volt':      1.,
    'millivolt': 1e-3,
    'microvolt': 1e-6,
    'nanovolt':  1e-9,
    'picovolt':  1e-12,
})


# Global register of dimensions
# dict[str, UnitConverter]
DimensionsRegister = {
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
}

# Rogue value to signal that a field is unitful but that the units are not recognized
INVALID_DIMENSIONS = 'invalid'