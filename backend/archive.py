from config import Config
import zipfile
import reader
from reader import read_investigation, read_study_sample, read_assay, read_annotations, read_processed_data

class Archive(object):
    def __init__(self, investigation, study_samples, assay, processed_data_set, annotations):
        self.investigation = investigation
        self.study_sample = study_samples
        self.assay = assay
        self.processed_data_set = processed_data_set
        self.annotations = annotations


def read_archive(cfg, archive_filename):
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
                            read_investigation(cfg, f)
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
            study_sample = read_study_sample(cfg, f)

        if 'STUDY ASSAYS' not in investigation:
            raise ValueError('No STUDY ASSAYS section defined in {0}'.format(
                investigation_file_name))
        for v in investigation['STUDY ASSAYS'].values():
            if type(v) == list:
                raise NotImplementedError(
                    'Only support 1 assay per investigation')
        required_STUDY_ASSAYS_fields = frozenset(['Study Assay File Name'])
        if not required_STUDY_ASSAYS_fields.issubset(
                investigation['STUDY ASSAYS'].keys()):
            raise ValueError(
                'Missing entries in STUDY ASSAYS section: {0}'.format(
                    required_STUDY_ASSAYS_fields.difference(
                        investigation['STUDY ASSAYS'].keys())))

        assay_file_name = investigation['STUDY ASSAYS'][
            'Study Assay File Name']
        if assay_file_name not in filenames:
            raise IOError('Assay file "{0}" is missing from archive'.format(
                assay_file_name))
        with z.open(assay_file_name, 'r') as f:
            assay = read_assay(cfg, f)

        # TODO: Support multiple data set files per study
        if len(set(assay['Derived Array Data Matrix File'])) != 1:
            raise NotImplementedError('Multiple data set files per study')
        processedDataFilename = assay['Derived Array Data Matrix File'].iloc[0]
        if processedDataFilename not in filenames:
            raise IOError(
                'Processed data file "{0}" is missing from archive'.format(
                    processedDataFilename))
        with z.open(processedDataFilename, 'r') as f:
            processed_data_set = read_processed_data(cfg, f)

        # Check that processed data file for a sample actually includes data for each sample
        for sampleName in study_sample['Sample Name']:
            if sampleName not in processed_data_set.columns:
                raise ValueError(
                    "Sample {0} has no corresponding data in {1}".format(
                        sampleName, processedDataFilename))

        # And check that every column in the processed data has an associated sample in the study
        for sampleName in processed_data_set.columns:
            if sampleName not in study_sample['Sample Name'].values:
                raise ValueError(
                    "No sample metadata for sample {0} in {1}".format(
                        sampleName, processedDataFilename))

        # TODO: Support multiple annotation files per study
        if len(set(assay['Comment[Annotation file]'])) != 1:
            raise NotImplementedError('Multiple annotation files per study')
        annotationFilename = assay['Comment[Annotation file]'].iloc[0]
        if annotationFilename not in filenames:
            raise IOError(
                'Annotations file "{0}" is missing from archive'.format(
                    annotationFilename))
        with z.open(annotationFilename, 'r') as f:
            annotationData = read_annotations(cfg, f)

        # Skip raw data for now

        return Archive(investigation, study_sample, assay, processed_data_set, annotationData)