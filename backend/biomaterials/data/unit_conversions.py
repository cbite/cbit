# -*- coding: utf-8 -*-
#
# NOTE: Sadly, all these unit conversions need to be duplicated in the
# Python backend and the TypeScript frontend.  Keep them in sync!
#
# Unit conversions accept all relevant units from this ontology:
# https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000

import math


class SingleUnitConverter(object):
    def __init__(self, uiName, fromCanonical, toCanonical, sortingKey, isCanonical=False):

        if not callable(fromCanonical):
            raise ValueError('`fromCanonical` is not callable')
        if not callable(toCanonical):
            raise ValueError('`toCanonical` is not callable')

        self.uiName = uiName
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

    def _makeSimpleSingleUnitConverter(self, unitDescription):
        uiName = unitDescription['uiName']
        unitInCanonicalUnits = unitDescription['value']
        return SingleUnitConverter(
            uiName=uiName,
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

    def getUnitUIName(self, unitName):
        return self._normalizedUnitConverters[self.normalizeUnitName(unitName)].uiName


# Unit conversions accept all relevant units from this ontology:
# https://www.ebi.ac.uk/ols/ontologies/uo/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FUO_0000000

# Special converter that does nothing
NoneConverter = UnitConverter({
    'none': { 'uiName': u'none', 'value': 1. }
})

# unit -> time unit
# Canonical unit: hours
TimeUnitConverter = UnitConverter({
    'century':     { 'uiName': u'century', 'value': 100 * 365 * 24 },
    'year':        { 'uiName': u'yr',      'value': 365 * 24 },
    'month':       { 'uiName': u'mon',     'value': (365. / 12.) * 24 },   # approximate
    'week':        { 'uiName': u'wk',      'value': 7 * 24 },
    'day':         { 'uiName': u'd',       'value': 24 },
    'hour':        { 'uiName': u'h',       'value': 1 },
    'minute':      { 'uiName': u'm',       'value': 1 / 60.0 },
    'second':      { 'uiName': u's',       'value': 1 / 60.0 / 60.0 },
    'millisecond': { 'uiName': u'ms',      'value': 1 / 1000. / 60. / 60. },
    'microsecond': { 'uiName': u'µs',      'value': 1 / 1000000. / 60. / 60. },
    'nanosecond':  { 'uiName': u'ns',      'value': 1 / 1000000000. / 60. / 60. },
    'picosecond':  { 'uiName': u'ps',      'value': 1 / 1000000000000. / 60. / 60. },
})


# unit -> concentration unit -> unit of molarity
# Canonical unit: mM
ConcentrationUnitConverter = UnitConverter({
    'molar':      { 'uiName': u'M',  'value': 1000.0 },
    'millimolar': { 'uiName': u'mM', 'value': 1 },
    'micromolar': { 'uiName': u'µM', 'value': 1 / 1000.0 },
    'nanomolar':  { 'uiName': u'nM', 'value': 1 / 1000000.0 },
    'picomolar':  { 'uiName': u'pM', 'value': 1 / 1000000000.0 },
    'femtomolar': { 'uiName': u'fM', 'value': 1 / 1000000000000.0 },
})


# unit -> mass unit, excluding unit -> mass unit -> molar mass unit
# Canonical unit: g
nAvogadro = 6.022140857e23  # http://physics.nist.gov/cgi-bin/cuu/Value?na
daltonInG = 12.0 / nAvogadro  # nAvogadro atoms of 12C have a mass of exactly 12g

MassUnitConverter = UnitConverter({
    'kilogram':   { 'uiName': u'kg',  'value': 1000 },
    'gram':       { 'uiName': u'g',   'value': 1 },
    'milligram':  { 'uiName': u'mg',  'value': 1 / 1000. },
    'microgram':  { 'uiName': u'µg',  'value': 1 / 1000000. },
    'nanogram':   { 'uiName': u'ng',  'value': 1 / 1000000000. },
    'picogram':   { 'uiName': u'pg',  'value': 1 / 1000000000000. },
    'femtogram':  { 'uiName': u'fg',  'value': 1 / 1000000000000000. },

    'dalton':     { 'uiName': u'Da',  'value': daltonInG },
    'kilodalton': { 'uiName': u'kDa', 'value': 1000 * daltonInG },
})

# unit -> area unit
# Canonical unit: m^2
AreaUnitConverter = UnitConverter({
    'square meter':      { 'uiName': u'm²',  'value': 1 },
    'square centimeter': { 'uiName': u'cm²', 'value': 1 / (100. ** 2) },
    'square millimeter': { 'uiName': u'mm²', 'value': 1 / (1000. ** 2) },
    'square angstrom':   { 'uiName': u'Å²',  'value': 1 / (10000000000. ** 2) },
})


# Special-purpose unit for cBiT
# % / [length unit]
# Canonical unit: % / week
WeightLossUnitConverter = UnitConverter({
    '% / century':     { 'uiName': u'% / century', 'value': (1. / (100 * 365 * 24)) / (1. / (7 * 24)) },
    '% / year':        { 'uiName': u'% / yr',      'value': (1. / (365 * 24)) / (1. / (7 * 24)) },
    '% / month':       { 'uiName': u'% / mon',     'value': (1. / ((365. / 12.) * 24)) / (1. / (7 * 24)) },  # approximate
    '% / week':        { 'uiName': u'% / wk',      'value': 1 },   # (1. / (7 * 24)) / (1. / (7 * 24)),
    '% / day':         { 'uiName': u'% / d',       'value': (1. / (24)) / (1. / (7 * 24)) },
    '% / hour':        { 'uiName': u'% / h',       'value': (1. / (1)) / (1. / (7 * 24)) },
    '% / minute':      { 'uiName': u'% / m',       'value': (1. / (1 / 60.0)) / (1. / (7 * 24)) },
    '% / second':      { 'uiName': u'% / s',       'value': (1. / (1 / 60.0 / 60.0)) / (1. / (7 * 24)) },
    '% / millisecond': { 'uiName': u'% / ms',      'value': (1. / (1 / 1000. / 60. / 60.)) / (1. / (7 * 24)) },
    '% / microsecond': { 'uiName': u'% / µs',      'value': (1. / (1 / 1000000. / 60. / 60.)) / (1. / (7 * 24)) },
    '% / nanosecond':  { 'uiName': u'% / ns',      'value': (1. / (1 / 1000000000. / 60. / 60.)) / (1. / (7 * 24)) },
    '% / picosecond':  { 'uiName': u'% / ps',      'value': (1. / (1 / 1000000000000. / 60. / 60.)) / (1. / (7 * 24)) },
})

# unit -> length unit, excluding centiMorgan, centiRay
# Canonical unit: m
LengthUnitConverter = UnitConverter({
    'meter':      { 'uiName': u'm',  'value': 1. },
    'centimeter': { 'uiName': u'cm', 'value': 1. / 100. },
    'millimeter': { 'uiName': u'mm', 'value': 1. / 1000. },
    'micrometer': { 'uiName': u'µm', 'value': 1. / 1000000. },
    'nanometer':  { 'uiName': u'nm', 'value': 1. / 1000000000. },
    'angstrom':   { 'uiName': u'Å',  'value': 1. / 10000000000. },
    'picometer':  { 'uiName': u'pm', 'value': 1. / 1000000000000. },
})


# unit -> pressure unit
# Canonical unit: pascal
PressureConverter = UnitConverter({
    'pascal':                 { 'uiName': u'Pa',    'value': 1. },
    'millimeters of mercury': { 'uiName': u'mm Hg', 'value': 133.322387415 }  # https://en.wikipedia.org/wiki/Millimeter_of_mercury
})


# unit -> angle unit -> plane angle unit
# Canonical unit: degree
AngleConverter = UnitConverter({
    'degree': { 'uiName': u'°',   'value': 1. },
    'radian': { 'uiName': u'rad', 'value': 360. / (2 * math.pi) }
})


# Special-purpose unit for cBiT
# NOTE: the ontology units for percent are useless!  I've removed them
# Canonical unit: %
PercentageConverter = UnitConverter({
    '%':       { 'uiName': u'%', 'value': 1. },
})


# unit -> dimensionless unit -> parts per notation unit
# Canonical unit: parts per million
# See https://en.wikipedia.org/wiki/Parts-per_notation for notes on abbreviations
PartsPerConverter = UnitConverter({
    'parts per hundred':       { 'uiName': u'%',                  'value': 10000. },
    'parts per thousand':      { 'uiName': u'parts per thousand', 'value': 1000. },
    'parts per million':       { 'uiName': u'ppm',                'value': 1. },
    'parts per billion':       { 'uiName': u'ppb',                'value': 1. / 1000. },
    'parts per trillion':      { 'uiName': u'ppt',                'value': 1. / 1000000. },
    'parts per quadrillion':   { 'uiName': u'ppq',                'value': 1. / 1000000000. },
})


# unit -> temperature unit
# Canonical unit: degree Celsius
# NOTE: Have to go to the extra mile to support temperature conversions
# that aren't simply scaling factors
TemperatureConverter = UnitConverter({
    'kelvin':            { 'uiName': 'K', 'value': 1. },
    'degree Celsius':    SingleUnitConverter(
        uiName =         u'°C',
        toCanonical =   (lambda TinC: TinC - 273.15),
        fromCanonical = (lambda TinK: TinK + 273.15),
        sortingKey =    10.,   # Larger values sort earlier
        isCanonical =   False
    ),
    'degree Fahrenheit': SingleUnitConverter(
        uiName =         u'°F',
        toCanonical =   (lambda TinF: (TinF - 32) * 5./9. - 273.15),
        fromCanonical = (lambda TinK: (TinK + 273.15) * 9./5. + 32),
        sortingKey =    5.,    # Larger values sort earlier
        isCanonical =   False
    )
})


# unit -> electric potential difference unit
# Canonical unit: volt
ElectricPotentialDifferenceConverter = UnitConverter({
    'megavolt':  { 'uiName': u'MV', 'value': 1e6 },
    'kilovolt':  { 'uiName': u'kV', 'value': 1e3 },
    'volt':      { 'uiName': u'V',  'value': 1. },
    'millivolt': { 'uiName': u'mV', 'value': 1e-3 },
    'microvolt': { 'uiName': u'µV', 'value': 1e-6 },
    'nanovolt':  { 'uiName': u'nV', 'value': 1e-9 },
    'picovolt':  { 'uiName': u'pV', 'value': 1e-12 },
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