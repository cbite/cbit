import zipfile
import reader
from common.data.study_type import StudyType, GeneExpressionType, determineBiomaterialsStudyType
from reader import (
    read_investigation,
    read_study_sample
)
import re
from biomaterials.data.unit_conversions import DimensionsRegister, INVALID_DIMENSIONS


class FieldAnalysisResults(object):
    def __init__(self, fieldName, isUnitful, possibleDimensions, looksNumeric):
        self.fieldName = fieldName
        self.isUnitful = isUnitful
        self.possibleDimensions = possibleDimensions
        self.looksNumeric = looksNumeric

    def to_json(self):
        return {
            'fieldName': self.fieldName,
            'isUnitful': self.isUnitful,
            'possibleDimensions': self.possibleDimensions,
            'looksNumeric': self.looksNumeric
        }


class Archive(object):
    def __init__(self, investigation_file_name, study_file_name, protocol_file_name, study_type, investigation, study_samples,
                 arrayExpressId, file_names):

        self.investigation_file_name = investigation_file_name
        self.study_file_name = study_file_name
        self.protocol_file_name = protocol_file_name
        self.study_type = study_type

        self.investigation = investigation
        self.study_sample = study_samples
        self.arrayExpressId = arrayExpressId
        self.file_names = file_names

    def analyse_fields(self):
        # TODO: Produce analysis for merged fields (e.g., '*Material') if one of the
        # underlying component fields is present
        result = []

        clean_column_names = {
            f: re.sub(r'^Factor Value\[(.*)\]$', r'\1',
                      re.sub(r'^Characteristics\[(.*)\]$', r'\1', f))
            for f in self.study_sample.columns.values
        }
        reverse_clean_column_names = {v: k for (k, v) in clean_column_names.iteritems()}

        # Fields in study_sample
        for origName in self.study_sample.columns.values:

            cleanName = clean_column_names[origName]

            filterOut = (cleanName.startswith('Protocol REF') or cleanName.endswith('Unit')
                         or self.study_sample[origName].isnull().values.all())

            unit_col_origName = None
            possible_unit_names = ['{0}Unit'.format(cleanName), '{0} Unit'.format(cleanName)]
            for possible_unit_name in possible_unit_names:
                if possible_unit_name in reverse_clean_column_names:
                    unit_col_origName = reverse_clean_column_names[possible_unit_name]
            isUnitful = unit_col_origName is not None

            if not isUnitful:
                possibleDimensions = []
            else:
                possibleDimensionsSet = set(DimensionsRegister.iterkeys())
                for value in self.study_sample[unit_col_origName]:
                    unitStr = unicode(value)
                    if unitStr and unitStr.lower() not in ('n/a', 'nan'):
                        thisValuePossibleDimensions = set()
                        for dimensions, unit_converter in DimensionsRegister.iteritems():
                            if unit_converter.isValidUnit(unicode(value)):
                                thisValuePossibleDimensions.add(dimensions)
                        possibleDimensionsSet = possibleDimensionsSet.intersection(thisValuePossibleDimensions)
                pass
                possibleDimensions = list(possibleDimensionsSet)

                # Reject archives with unitful quantities but unrecognized units
                if not possibleDimensions:
                    possibleDimensions = [INVALID_DIMENSIONS]

            looksNumeric = True
            for value in self.study_sample[origName]:
                if unicode(value) not in ('n/a', 'nan'):
                    try:
                        float(unicode(value))
                    except ValueError as e:
                        looksNumeric = False

            if not filterOut:
                result.append(FieldAnalysisResults(cleanName, isUnitful, possibleDimensions, looksNumeric))

        # Special 'Protocols' field that coalesces all Protocol.REFs
        result.append(
            FieldAnalysisResults(fieldName='Protocols', isUnitful=False, possibleDimensions=[], looksNumeric=False))

        # Synthesize analysis for merged fields
        # TODO: Refactor all this stuff so that merged fields and synthetic fields
        # are defined in exactly one place
        merged_fields = {
            '*Material': ('Material abbrevation', 'Material Name'),
            '*Cell strain': ('Cell strain abbreviation', 'Cell strain full name'),
            '*Compound': ('Compound abbreviation', 'Compound'),
        }
        for mergedFieldName, (firstFieldName, secondFieldName) in merged_fields.iteritems():
            if firstFieldName in reverse_clean_column_names or secondFieldName in reverse_clean_column_names:
                result.append(FieldAnalysisResults(
                    fieldName=mergedFieldName,
                    isUnitful=False,
                    possibleDimensions=[],
                    looksNumeric=False
                ))

        return result


def read_archive(archive_filename):
    with zipfile.ZipFile(archive_filename, mode='r') as z:
        filenames = z.namelist()

        # This is the only hard-coded filename
        investigation_file_name = 'i_Investigation.txt'
        if investigation_file_name not in filenames:
            raise IOError(
                'Investigation file "{0}" is missing from archive'.format(
                    investigation_file_name))

        with z.open(investigation_file_name, 'r') as f:
            investigation = reader.conform_investigation_to_schema(
                reader.remove_isa_name_prefixes(
                    reader.remove_empty_values_in_dict(
                        reader.flatten_investigation(
                            read_investigation(f)
                        )
                    )
                )
            )

        if 'STUDY' not in investigation:
            raise ValueError('No STUDY section defined in {0}'.format(
                investigation_file_name))
        for v in investigation['STUDY'].values():
            if type(v) == list:
                raise ValueError(
                    'Only support 1 study per investigation')
        required_STUDY_fields = frozenset([
            'Study Identifier',
            'Study Title',
            'Study File Name',
            'Study Public Release Date',
            'Study Description'
        ])
        if not required_STUDY_fields.issubset(investigation['STUDY'].keys()):
            raise ValueError('Missing entries in STUDY section: {0}'.format(
                required_STUDY_fields.difference(
                    investigation['STUDY'].keys())))

        study_file_name = investigation['STUDY']['Study File Name']
        if study_file_name not in filenames:
            raise IOError('Study file "{0}" is missing from archive'.format(
                study_file_name))
        with z.open(study_file_name, 'r') as f:
            study_sample = read_study_sample(f)

        if 'Characteristics[Gene expression type]' not in study_sample.columns:
            raise ValueError(
                'Characteristics[Gene expression type] column does not exits in {0}.'
                    .format(study_file_name))

        if len(study_sample['Characteristics[Gene expression type]'].unique()) != 1:
            raise ValueError('All rows should have the same value for Characteristics[Gene expression type].')

        geneExpressionType = study_sample['Characteristics[Gene expression type]'][0]
        study_type = determineBiomaterialsStudyType(geneExpressionType)
        if study_type not in [StudyType.biomaterial_rna_seq, StudyType.biomaterial_microarray]:
            raise ValueError(
                'Incorrect value specified for Characteristics[Gene expression type]: {0}. Should be {1} or {2}'
                    .format(geneExpressionType, GeneExpressionType.microarray, GeneExpressionType.rna_seq))

        if 'Characteristics[ArrayExpress Accession ID]' not in study_sample.columns:
            raise ValueError(
                'Characteristics[ArrayExpress Accession ID] column does not exits in {0}.'
                    .format(study_file_name))

        if len(study_sample['Characteristics[ArrayExpress Accession ID]'].unique()) != 1:
            raise ValueError('All rows should have the same value for Characteristics[ArrayExpress Accession ID].')

        arrayExpressId = study_sample['Characteristics[ArrayExpress Accession ID]'][0]

        if 'STUDY ASSAYS' not in investigation:
            raise ValueError('No STUDY ASSAYS section defined in {0}'.format(
                investigation_file_name))
        for v in investigation['STUDY ASSAYS'].values():
            if type(v) == list:
                raise NotImplementedError(
                    'Only support 1 assay per investigation')

        if 'STUDY PROTOCOLS' not in investigation:
            raise ValueError('No STUDY PROTOCOLS section defined in {0}'.format(
                investigation_file_name))

        def getDescription(d):
            return d['Study Protocol Description']

        descriptions = map(getDescription, investigation['STUDY PROTOCOLS'])
        if len(descriptions) == 0:
            raise ValueError('There should at least be 1 "Study Protocol Description" specified.')

        if descriptions.count(descriptions[0]) != len(descriptions):
            raise ValueError('All specified "Study Protocol Description" values should be equal.')

        protocol_file_name = descriptions[0]

        if protocol_file_name not in filenames:
            raise IOError('Protocol file "{0}" is missing from archive'.format(
                protocol_file_name))

        return Archive(investigation_file_name, study_file_name, protocol_file_name,study_type, investigation, study_sample,
                       arrayExpressId, filenames)
