

import {FieldMeta} from '../../../../core/types/field-meta';

export function isTranscriptomicsAssayDetail(fieldName: string): boolean {
  return fieldName.startsWith('Transcriptomics Assay Detail: ');
}

export const TRANSCRIPTOMIC_ASSY_DETAIL_DEFAULT_METADATA: FieldMeta = {
  description: '',
  visibility: 'visible',
  category: 'Technical > General',
  dataType: 'string',
  dimensions: 'none',
  preferredUnit: 'none'
};

export const KNOWN_METADATA_FIELDS: { [fieldName: string]: FieldMeta } = {

  // Technical properties - Microarray
  'Gene expression type': {
    'category': 'Technical > General',
    'dataType': 'string',
    'description': 'Gene expression technology used for the samples, e.g. Microarray, RNA sequencing.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },

  // Technical properties - Microarray
  'Array or chip design': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'The design of the microarray, e.g. Illumina HT12v4', // TODO@MT change
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Platform': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'Type of platform/manufacturer used, e.g. Illumina, Affymetrix, Agilent.', // TODO@MT change
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Annotation file': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'File name of vendor-provided annotations for each gene probe (one file per study)',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Transcriptomics Assay Detail: Array Data File': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'Raw Data File name or URI for microarray data (one sample per file)',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Transcriptomics Assay Detail: Array Data Matrix File': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'Raw Data File name or URI for microarray data (multiple samples per file)',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Transcriptomics Assay Detail: Derived Array Data File': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'Processed Data File name or URI for microarray data (one sample per file)',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Transcriptomics Assay Detail: Derived Array Data Matrix File': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'Processed Data File name or URI for microarray data (multiple samples)',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Transcriptomics Assay Detail: Normalization Name': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Background correction': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Data Transformation Name': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Label': {
    'category': 'Technical > Microarray',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },

  // Technical properties - RNA sequencing
  'RNAseq Platform': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'Type of platform/manufacturer used, e.g. Illumina, Affymetrix, Agilent.', // TODO@MT change
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'RNAseq System': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'The design of the RNAseq chip, e.g. Illumina HT12v4', // TODO@MT change
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Raw Data File': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'Raw Data File name or URI for RNAseq data (one sample per file)',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Transcriptomics Assay Detail: Derived Data File': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'Processed Data File name or URI for RNAseq data (one sample per file)',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Transcriptomics Assay Detail: Sequencing instrument': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'Sequencing instrument name',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Base caller': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Library layout': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: MID': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Transcriptomics Assay Detail: Quality scorer': {
    'category': 'Technical > RNA sequencing',
    'dataType': 'string',
    'description': 'No description available',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },

  // Biological properties
  'Source Name': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'The source is the study ID, i.e. the source where samples come from.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Barcode': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Barcode of microarray or RNAseq chip, including location of array or lane the sample was placed on, e.g. 123456789-A is a microarray with code 123456789 where the sample was placed on position A.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Study ID': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'The Study ID that identifies the study.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Group ID': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'The group ID (should be a number) that identifies a group of samples (usually replicates) receiving the same treatment within a study. E.g. all samples exposed to compound X at dose Y for time span Z.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Biological Replicate': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Biological replicate ID. Within each group of samples (identified by the group ID) this number indicates the biological replicate (e.g. in group ID “1”, there are three biological replicates indicated as “1”, “2”, and “3”). If all samples have a biological replicate ID of “1” there are no biological replicates.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Technical Replicate': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Technical replicate ID. Leave blank if there are no technical replicates, otherwise a number indicates the technical replicate (e.g. in group ID “2”, there are two biological replicates, each of which has three technical replicates indicated as “1”, “2”, and “3”).',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Sample ID': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'The Sample ID describes each sample in a unique way within each study. It consecutively consists of a study ID, a group ID, a biological replicate ID and when available, a technical replicate ID, separated by dashes. E.g.: 5-2-1 meaning study 5, group 2, biological replicate 1. Or another example: 2-2-3-1, meaning study 2, group 2, biological replicate 3, technical replicate 1.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },

  '*Cell strain': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Cell line name for cell line work, donor name (e.g. a human stem cell donor, coded name), or isolated cell type name for human subjects or animals.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Cell strain abbreviation': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Abbreviation of cell line name for cell line work, donor abbreviation (e.g. a human stem cell donor), or abbreviation of isolated cell type for human subjects or animals.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Cell strain'
  },
  'Cell strain full name': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Full name of cell line for cell line work, donor name (e.g. a human stem cell donor, coded name), or isolated cell type name for human subjects or animals.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Animal strain': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'The name of the animal strain used for in vivo experiments.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Cell type': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Type of cells (not cell line), e.g. bone marrow cells, osteosarcoma cells, etc.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Cell type'
  },
  'Tissue': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Type of tissue the sample comes from (i.e. one of the four basic tissue types: epithelium, connective, muscular, or nervous).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Organ': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Organ from which the sample originates.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Organ'
  },
  'Organism': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Organism from which the sample originates.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Organism'
  },
  'Sex': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Sex of the original source sample. “unknown” means it is either not known or possibly mixed, e.g. when a pool of cells is used with multiple sexes.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Age': {
    'category': 'Biological',
    'dataType': 'double',
    'description': 'Age of animal or human subject in case of in vivo or ex vivo studies.',
    'visibility': 'visible',
    'dimensions': 'time',
    'preferredUnit': 'year'
  },
  'In vivo treatment duration': {
    'category': 'Biological',
    'dataType': 'double',
    'description': 'Treatment time for animal experiments or human experiments (not compound exposure study).',
    'visibility': 'visible',
    'dimensions': 'time',
    'preferredUnit': 'hour'
  },
  'Passage number': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'The passage number of the cell line at which the experiments took place (in case of in vitro experiments).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Assay Type': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Type of assay (in vitro, in vivo or ex vivo).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Assay Type'
  },
  'Culture medium': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'The type of culture medium used.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Attach Duration': {
    'category': 'Biological',
    'dataType': 'double',
    'description': 'Time allowed for cell attachment before start of compound exposure and/or start of culture duration experiment.',
    'visibility': 'visible',
    'dimensions': 'time',
    'preferredUnit': 'hour'
  },
  'Control': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Control flag, is a sample a control or not (true or false).',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Control'
  },
  'Group Match': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Group ID number of the matching control group for a given sample (when empty, no control group is linked to this sample). The sample match does not necessarily mean that the matching control is paired (this is indicated in the field “Paired sample”). It is only matched at the group level.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Paired sample': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Is the sample paired to a control sample or other type of paired sample? (relevant for statistical purposes) If a sample is paired to another sample (e.g. a measurement in a mouse on day 5 compared to day 0 in that same mouse), the sample barcode of the paired control sample is shown. Control samples themselves are not shown as paired.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  '*Compound': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Compound name and abbreviation (for exposure studies).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Compound': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Compound name (for exposure studies).',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Compound abbreviation': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Compound name abbreviation (for exposure studies).',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Compound'
  },
  'CAS number': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Compound CAS (Chemical Abstracts Service) number.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Dose': {
    'category': 'Biological',
    'dataType': 'double',
    'description': 'Dose per administration of compound (for exposure studies).',
    'visibility': 'visible',
    'dimensions': 'concentration',
    'preferredUnit': 'millimolar',
    'nameInSampleMiniSummary': 'Dose'
  },
  'Dose Duration': {
    'category': 'Biological',
    'dataType': 'double',
    'description': 'Duration of dose treatment (for exposure studies).',
    'visibility': 'visible',
    'dimensions': 'time',
    'preferredUnit': 'hour'
  },
  'Dose Frequency': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Dose frequency (for repeat exposure studies).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Vehicle': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Vehicle used to dilute the compound (water, dimethyl sulfoxide, etc.).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Route': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Administration route in animal experiment (gavage, injection, etc.).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Culture Duration': {
    'category': 'Biological',
    'dataType': 'double',
    'description': 'Culture time on biomaterial (after attachment) until isolation of cells.',
    'visibility': 'visible',
    'dimensions': 'time',
    'preferredUnit': 'hour'
  },
  'Biomaterial graphs file': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Name (or URI) of the file that contains the biomaterial characteristics displayed as a graph or image.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'isSupplementaryFileName': true
  },
  'Protocol REF': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'Internal ISAtab protocol references',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Sample Name': {
    'category': 'Biological',
    'dataType': 'string',
    'description': 'A unique sample name corresponding to the microarray or RNAseq chip barcode.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },

  // Material Properties > General
  'Material Class': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Class of material, e.g. ceramic, metal, polymer, composite, natural graft.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Material Class'
  },
  '*Material': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Material name and abbreviation.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Material Name': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Full name of the type of material.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Material abbreviation': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Abbreviation of the type of material.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Material'
  },
  'Material Shape': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'The shape of the material, e.g. flat, particle, disc, cylinder, block, coating, paste/injectable, cement, hydrogel.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none',
    'nameInSampleMiniSummary': 'Material Shape'
  },
  'Sintering temperature': {
    'category': 'Material > General',
    'dataType': 'double',
    'description': 'Sintering temperature of the material in degree Celsius.',
    'visibility': 'visible',
    'dimensions': 'temperature',
    'preferredUnit': 'degree Celsius'
  },
  'Manufacturer': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Manufacturer of the material.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Etching': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Type of etching process used on material.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Coating': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Type of coating applied on base material.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Clinically applied': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Has the material been clinically applied?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Biologically degradable': {
    'category': 'Material > General',
    'dataType': 'string',
    'description': 'Is the material biologically degradable?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },

  // Material Properties > Chemical
  'Phase composition': {
    'category': 'Material > Chemical',
    'dataType': 'double',
    'description': 'Percentage of each phase in the material.',
    'visibility': 'visible',
    'dimensions': 'percentage',
    'preferredUnit': '%'
  },
  'Phase composition device': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'The device used to measure the phase composition, e.g. XRD, EDS.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Elements composition': {
    'category': 'Material > Chemical',
    'dataType': 'double',
    'description': 'Element concentrations in material in parts per million (ppm).',
    'visibility': 'visible',
    'dimensions': 'parts_per',
    'preferredUnit': 'parts per million'
  },
  'Elements composition device': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'The device used to measure the elements composition (e.g. ICP-MS or EDS).',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Elements composition graph': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'Elements composition of the surface as measured by EDS: a graph plotting the intensity (counts) versus the energy (keV). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Molecular structure graph': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'The molecular structure of the material as determined by FTIR (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Degradation/ion release graph': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'Degradation or ion release in for example SPS, SBF, PBS, water, medium (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Degradation/ion release device': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'The device used to measure degradation/ion release, e.g. ICP-MS, colorimetric methods.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Molecular weight graph': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'The distribution of molecular weight as measured by GPC (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Corrosion graph': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'The amount of oxide formed in SPS, SBF, PBS, water, medium (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Corrosion device': {
    'category': 'Material > Chemical',
    'dataType': 'string',
    'description': 'The device used to measure corrosion, e.g. EDS, ICP-MS.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Weight loss': {
    'category': 'Material > Chemical',
    'dataType': 'double',
    'description': 'The percentage of weight loss of the material per time unit.',
    'visibility': 'visible',
    'dimensions': 'weight_loss',
    'preferredUnit': '% / week'
  },

  // Material Properties > Physical
  'Crystallinity': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'The percentage of amorphous/crystalline material.',
    'visibility': 'visible',
    'dimensions': 'percentage',
    'preferredUnit': '%'
  },
  'Crystallinity device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure the crystallinity, e.g. XRD, SAXS/WAXS.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Crystal structure': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'Crystal structure, followed by lattice parameters (a,b,c).',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Porosity': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'The percentage of porosity of the material.',
    'visibility': 'visible',
    'dimensions': 'percentage',
    'preferredUnit': '%'
  },
  'Porosity device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure the porosity, e.g. microCT, mercury intrusion.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Pore size': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'Pore diameter size.',
    'visibility': 'visible',
    'dimensions': 'length',
    'preferredUnit': 'micrometer'
  },
  'Pore size device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure the pore size, e.g. microCT, SEM, profilometer.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Grain size': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'The grain size of the material as measured by SEM.',
    'visibility': 'visible',
    'dimensions': 'length',
    'preferredUnit': 'nanometer'
  },
  'Grain size device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure grain size, e.g. SEM, XRD.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Surface roughness Ra': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'Surface roughness: average profile roughness parameter Ra.',
    'visibility': 'visible',
    'dimensions': 'length',
    'preferredUnit': 'micrometer'
  },
  'Surface roughness Sa': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'Surface roughness, average area roughness parameter Sa.',
    'visibility': 'visible',
    'dimensions': 'length',
    'preferredUnit': 'micrometer'
  },
  'Surface roughness graph': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'Surface roughness (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Surface roughness device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure surface roughness, e.g. microCT, profilometer.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Specific surface area': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'Specific surface area of the material.',
    'visibility': 'visible',
    'dimensions': 'area',
    'preferredUnit': 'square millimeter'
  },
  'Specific surface area device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure the specific surface area, e.g. BET, Gas absorption.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Wettability': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'Wettability of the material (contact angle) with a liquid.',
    'visibility': 'visible',
    'dimensions': 'angle',
    'preferredUnit': 'degree'
  },
  'Surface charge': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'The surface charge of the material measured as zeta potential.',
    'visibility': 'visible',
    'dimensions': 'electric_potential_difference',
    'preferredUnit': 'millivolt'
  },
  'Surface charge device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure the surface charge, e.g. DLS, M3-PALS.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Density graph': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'Distribution of densities as measured by microCT (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Polymerization mechanism': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The mechanism of polymerization, e.g. condensation polymerization, addition (chain-growth) polymerization, ring opening polymerization, etc.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Crosslinking degree': {
    'category': 'Material > Physical',
    'dataType': 'double',
    'description': 'Degree of crosslinking (%).',
    'visibility': 'visible',
    'dimensions': 'percentage',
    'preferredUnit': '%'
  },
  'Crosslinking degree device': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'The device used to measure the degree of crosslinking, e.g. XRD, SAXS/WAXS, rheometer.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Homogeneity of ceramic distribution': {
    'category': 'Material > Physical',
    'dataType': 'string',
    'description': 'Homogeneity of ceramic distribution in composite materials, i.e. are ceramic particles distributed homogenously (yes) or do they form aggregates (no)?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },

  // Material Properties > Mechanical
  'Elasticity': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Elasticity of the material (elastic modulus, average).',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Elasticity distribution graph': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Distribution of stiffnesses (elastic modulus) (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Elasticity device': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'The device used to measure elasticity, e.g. Nanoindentator, AFM, microCT.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Toughness': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Toughness of the material as measured by Nanoindentator.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Hardness': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Knoop hardness as measured by Nanoindentator.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Compressive strength': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Compressive strength as measured by mechanical tester.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Compressive strength graph': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Compressive strength as measured by mechanical tester (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Tensile strength': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Tensile strength as measured by mechanical tester.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Tensile strength graph': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Tensile strength as measured by mechanical tester (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Rheology': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Rheology (Reynolds number) as measured by rheometer.',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Rheology graph': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Rheology as measured by rheometer (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Torsion': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Torsion as measured by mechanical tester.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Torsion graph': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Torsion as measured by mechanical tester (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Shear stress': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Shear stress as measured by rheometer or mechanical tester.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Shear stress graph': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Shear stress as measured by rheometer or mechanical tester (graph). Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Shear stress device': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'The device used to measure shear, e.g. rheometer, mechanical tester.',
    'visibility': 'hidden',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Bending strength': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Bending strength as measured by mechanical tester.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
  'Bending strength graph': {
    'category': 'Material > Mechanical',
    'dataType': 'string',
    'description': 'Bending strength as measured by mechanical tester. Are data available yes/no?',
    'visibility': 'visible',
    'dimensions': 'none',
    'preferredUnit': 'none'
  },
  'Stress rupture': {
    'category': 'Material > Mechanical',
    'dataType': 'double',
    'description': 'Stress rupture as measued by mechanical tester.',
    'visibility': 'visible',
    'dimensions': 'pressure',
    'preferredUnit': 'pascal'
  },
}
