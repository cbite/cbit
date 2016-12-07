import {Component, OnInit, ChangeDetectorRef, Input, Output, OnChanges, EventEmitter} from '@angular/core';
import {Router} from "@angular/router";
import {
  FileUploader, FileSelectDirective, FileDropDirective,
  ParsedResponseHeaders, FileUploaderOptions
} from 'ng2-file-upload/ng2-file-upload';
//import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class'
import * as $ from 'jquery';
import {FieldMeta, DimensionsType} from "../common/field-meta.model";
import {FormGroup, FormControl, Validators, RequiredValidator} from "@angular/forms";
import * as _ from 'lodash';
import {DimensionsRegister, INVALID_DIMENSIONS} from "../common/unit-conversions";

// Heavily adapted from here:
// http://valor-software.com/ng2-file-upload/

const URL = 'http://localhost:23456/uploads';

const KNOWN_METADATA_FIELDS: { [fieldName: string]: FieldMeta } = {

  // Technical properties
  "Gene expression type": {
    "category": "Technical",
    "dataType": "string",
    "description": "Gene expression tehcnology used for the samples, e.g. Microarray, RNA sequencing. Use OBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Platform": {
    "category": "Technical",
    "dataType": "string",
    "description": "Type of platform used, e.g. Illumina, Affymetrix, Agilent. Use OBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Array or chip design": {
    "category": "Technical",
    "dataType": "string",
    "description": "The design of the microarray or RNAseq chip, e.g. Illumina HT12v4",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },

  // Biological properties
  "Source Name": {
    "category": "Biological",
    "dataType": "string",
    "description": "The source is the study ID, i.e. the source where samples come from.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Barcode": {
    "category": "Biological",
    "dataType": "string",
    "description": "Barcode of microarray or RNAseq chip, including location of array or lane the sample was placed on, e.g. 123456789-A is a microarray with code 123456789 where the sample was placed on position A.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Study ID": {
    "category": "Biological",
    "dataType": "string",
    "description": "The Study ID (should be a number) that identifies the study.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Group ID": {
    "category": "Biological",
    "dataType": "string",
    "description": "The group ID (should be a number) that identifies a group of samples receiving the same treatment within a study. E.g. all samples exposed to compound X at dose Y for time span Z.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Biological Replicate": {
    "category": "Biological",
    "dataType": "string",
    "description": "Biological replicate ID. Put 1 for all samples if there are no biological replicates, otherwise use a number for each replicate group (required)",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Technical Replicate": {
    "category": "Biological",
    "dataType": "string",
    "description": "Technical replicate ID. Leave blank if there are no technical replicates, otherwise use a number for each technical replicate group.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Sample ID": {
    "category": "Biological",
    "dataType": "string",
    "description": "The Sample ID describes each sample in a unique way within each study. It consists of a study ID, a group ID and a biological replicate ID (and when available, a technical replicate ID), separated by dashes. E.g.: 5-2-1 meaning study 5, group 2, bioreplicate 1.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },

  "*Cell strain": {
    "category": "Biological",
    "dataType": "string",
    "description": "Cell line name for cell line work or donor abbreviation (e.g. a human stem cell donor).",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Cell strain abbreviation": {
    "category": "Biological",
    "dataType": "string",
    "description": "Abbreviation of cell line name for cell line work or donor abbreviation (e.g. a human stem cell donor), CLO term when available (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Cell strain full name": {
    "category": "Biological",
    "dataType": "string",
    "description": "Full name of cell line name for cell line work or donor abbreviation (e.g. a human stem cell donor).",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Animal strain": {
    "category": "Biological",
    "dataType": "string",
    "description": "The name of the animal strain used for in vivo experiments.",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Cell type": {
    "category": "Biological",
    "dataType": "string",
    "description": "Type of cells (not cell line), e.g. bone marrow cells, osteosarcoma cells, etc.",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Tissue": {
    "category": "Biological",
    "dataType": "string",
    "description": "Type of tissue the sample comes from, choose between: epithelium, connective, muscular, or nervous.",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Organ": {
    "category": "Biological",
    "dataType": "string",
    "description": "Organ from which the sample originates, UBERON term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Organism": {
    "category": "Biological",
    "dataType": "string",
    "description": "Provide taxonomic information for the source sample, NCBITaxon term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Sex": {
    "category": "Biological",
    "dataType": "string",
    "description": "Sex (sex of original source, male/female). unknown if not known or when a pool of cells is used with multiple sexes.",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Age": {
    "category": "Biological",
    "dataType": "double",
    "description": "Age of animal or human subject in case of in vivo or ex vivo studies.",
    "visibility": "main",
    "dimensions": "time",
    "preferredUnit": "year"
  },
  "Passage number": {
    "category": "Biological",
    "dataType": "string",
    "description": "The passage number of the cell line at which the experiments took place (in case of in vitro experiments).",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Assay Type": {
    "category": "Biological",
    "dataType": "string",
    "description": "Type of assay (in vitro, in vivo or ex vivo) (required)",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Culture medium": {
    "category": "Biological",
    "dataType": "string",
    "description": "The type of culture medium used (use standard abbreviation, but no special characters).",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Attach Duration": {
    "category": "Biological",
    "dataType": "double",
    "description": "Time allowed for cell attachment before start of compound exposure and/or start of culture duration experiment.",
    "visibility": "additional",
    "dimensions": "time",
    "preferredUnit": "hour"
  },
  "Control": {
    "category": "Biological",
    "dataType": "string",
    "description": "Control flag, is a sample a control or not (true or false) (required)",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Sample Match": {
    "category": "Biological",
    "dataType": "string",
    "description": "Sample name of the matching control sample (leave empty if no control is linked to this sample). The sample match does not necessarily mean that the matching control is paired (in the statistical sense). If it is paired, this is indicated in the field Paired sample.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Paired sample": {
    "category": "Biological",
    "dataType": "string",
    "description": "Is the sample paired to another sample? (relevant for statistical purposes) A group (minimal of two samples) that is paired should be indicated with the same letter (e.g. A for the first group of paired samples, B for the second, etc.). Leave blank if samples are not paired.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "*Compound": {
    "category": "Biological",
    "dataType": "string",
    "description": "Compound Name for exposure study",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Compound": {
    "category": "Biological",
    "dataType": "string",
    "description": "Compound Name for exposure study, CHEBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Compound abbreviation": {
    "category": "Biological",
    "dataType": "string",
    "description": "Compound abbreviation",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "CAS number": {
    "category": "Biological",
    "dataType": "string",
    "description": "Compound CAS (Chemical Abstracts Service) number",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Dose": {
    "category": "Biological",
    "dataType": "double",
    "description": "Dose per administration",
    "visibility": "main",
    "dimensions": "concentration",
    "preferredUnit": "millimolar"
  },
  "Dose Duration": {
    "category": "Biological",
    "dataType": "double",
    "description": "Duration of dose treatment; only for compound exposure study",
    "visibility": "main",
    "dimensions": "time",
    "preferredUnit": "hour"
  },
  "Dose Frequency": {
    "category": "Biological",
    "dataType": "string",
    "description": "Dose frequency; only for repeat dose toxicity study",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Vehicle": {
    "category": "Biological",
    "dataType": "string",
    "description": "Vehicle used to dilute the compound (water, dimethyl sulfoxide, etc.), CHEBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Route": {
    "category": "Biological",
    "dataType": "string",
    "description": "Administration route (gavage, injection, etc.), ERO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Culture Duration": {
    "category": "Biological",
    "dataType": "double",
    "description": "Culture time on biomaterial (after attachment) until isolation of cells",
    "visibility": "main",
    "dimensions": "time",
    "preferredUnit": "hour"
  },
  "Biomaterial graphs file": {
    "category": "Biological",
    "dataType": "string",
    "description": "Name (or URI) of the file that contains the biomaterial characteristics displayed as a graph or image",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Protocol REF": {
    "category": "Biological",
    "dataType": "string",
    "description": "Internal ISAtab protocol references",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Sample Name": {
    "category": "Biological",
    "dataType": "string",
    "description": "A unique name for each of your samples after all treatments described here (required). The microarray barcode is the best option here.",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },

  // Material Properties > General
  "Material Class": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Class of material. E.g.: ceramic, metal, polymer, composite, natural graft",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "*Material": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Type of material",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Material Name": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Full name of the type of material",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Material abbreviation": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Abbreviation of the type of material",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Material Shape": {
    "category": "Material > General",
    "dataType": "string",
    "description": "The shape of the material. Choose from: flat (for polystyrene culture flasks/dishes/plates), particle, disc, cylinder, block, coating, paste/injectable, cement, hydrogel",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Sintering temperature": {
    "category": "Material > General",
    "dataType": "double",
    "description": "Sintering temperature of the material in degree Celsius.",
    "visibility": "main",
    "dimensions": "temperature",
    "preferredUnit": "degree Celsius"
  },
  "Manufacturer": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Manufacturer of the material",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Etching": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Type of etching process used on material",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Coating": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Type of coating applied on base material",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Clinically applied": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Has the material been clinically applied? (in this or other studies) yes/no",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Biologically degradable": {
    "category": "Material > General",
    "dataType": "string",
    "description": "Is the material biologically degradable? yes/no",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },

  // Material Properties > Chemical
  "Phase composition": {
    "category": "Material > Chemical",
    "dataType": "double",
    "description": "Percentage (%) of each phase in the material, separated by semi-colons, e.g.: TCP=80;HA=20",
    "visibility": "main",
    "dimensions": "percentage",
    "preferredUnit": "%"
  },
  "Phase composition device": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "The device used to measure the phase composition, e.g. XRD, EDS",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Elements composition": {
    "category": "Material > Chemical",
    "dataType": "double",
    "description": "Element concentrations in material in parts per million (ppm) as measured by ICP-MS, separated by semi-colon, e.g.: Ca=800;P=400",
    "visibility": "main",
    "dimensions": "parts_per",
    "preferredUnit": "parts per million"
  },
  "Elements composition device": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "The device used to measure the elements composition (e.g. ICP-MS or EDS).",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Elements composition graph": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "Elements composition of the surface as measured by EDS: a graph plotting the intensity (counts) versus the energy (keV). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Molecular structure graph": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "The molecular structure of the material as determined by FTIR (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Degradation/ion release graph": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "Degradation or ion release in for example SPS, SBF, PBS, water, medium (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Degradation/ion release device": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "The device used to measure degradation/ion release, e.g. ICP-MS, colorimetric methods",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Molecular weight graph": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "The distribution of molecular weight as measured by GPC (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Corrosion graph": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "The amount of oxide formed in SPS, SBF, PBS, water, medium (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Corrosion device": {
    "category": "Material > Chemical",
    "dataType": "string",
    "description": "The device used to measure corrosion, e.g. EDS, ICP-MS",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Weight loss": {
    "category": "Material > Chemical",
    "dataType": "double",
    "description": "The weight loss of the material per time Unit",
    "visibility": "main",
    "dimensions": "weight_loss",
    "preferredUnit": "% / week"
  },

  // Material Properties > Physical
  "Crystallinity": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "The percentage (%) of amorphous/crystalline material",
    "visibility": "main",
    "dimensions": "percentage",
    "preferredUnit": "%"
  },
  "Crystallinity device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure the crystallinity, e.g. XRD, SAXS/WAXS",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Crystal structure": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "Crystal structure (categorical), followed by lattice parameters (a,b,c), e.g.: hexagonal;(3,5,7)",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Porosity": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "The percentage of porosity of the material",
    "visibility": "main",
    "dimensions": "percentage",
    "preferredUnit": "%"
  },
  "Porosity device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure the porosity, e.g. microCT, mercury intrusion",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Pore size": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "Pore diameter size",
    "visibility": "main",
    "dimensions": "length",
    "preferredUnit": "micrometer"
  },
  "Pore size device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure the pore size, e.g. microCT, SEM, profilometer",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Grain size": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "The grain size of the material as measured by SEM.",
    "visibility": "main",
    "dimensions": "length",
    "preferredUnit": "nanometer"
  },
  "Grain size device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure grain size, e.g. SEM, XRD",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Surface roughness Ra": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "Surface roughness, average profile roughness parameter Ra in micrometers",
    "visibility": "main",
    "dimensions": "length",
    "preferredUnit": "micrometer"
  },
  "Surface roughness Sa": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "Surface roughness, average area roughness parameter Sa in micrometers",
    "visibility": "main",
    "dimensions": "length",
    "preferredUnit": "micrometer"
  },
  "Surface roughness graph": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "Surface roughness (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Surface roughness device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure surface roughness, e.g. microCT, profilometer",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Specific surface area": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "Specific surface area of the material",
    "visibility": "main",
    "dimensions": "area",
    "preferredUnit": "square millimeter"
  },
  "Specific surface area device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure the specific surface area, e.g. BET, Gas absorption",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Wettability": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "Wettability of the material (contact angle in degrees) with a liquid measured with contact angle device.Write down as e.g. water=45;ethanol=60",
    "visibility": "main",
    "dimensions": "angle",
    "preferredUnit": "degree"
  },
  "Surface charge": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "The surface charge of the material measured as zeta potential (in millivolt).",
    "visibility": "additional",
    "dimensions": "electric_potential_difference",
    "preferredUnit": "millivolt"
  },
  "Surface charge device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure the surface charge, e.g. DLS, M3-PALS",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Density graph": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "Distribution of densities as measured by microCT (graph). Are data available yes/no?",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Alignment of crystals": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "Alignment of crystals in a polymer as measured by SAXS/WAXS",
    "visibility": "main",
    "dimensions": "none",    // TODO: FIXME
    "preferredUnit": "none"  // TODO: FIXME
  },
  "Polymerization mechanism": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The mechanism of polymerization, e.g. condensation polymerization, addition (chain-growth) polymerization, ring opening polymerization, etc.",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Crosslinking degree": {
    "category": "Material > Physical",
    "dataType": "double",
    "description": "Degree of crosslinking (%)",
    "visibility": "main",
    "dimensions": "percentage",
    "preferredUnit": "%"
  },
  "Crosslinking degree device": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "The device used to measure the degree of crosslinking, e.g. XRD, SAXS/WAXS, rheometer",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Homogeneity of ceramic distribution": {
    "category": "Material > Physical",
    "dataType": "string",
    "description": "Homogeneity of ceramic distribution in composite materials, i.e. are ceramic particles distributed homogenously or do they form aggregates? yes/no respectively",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },

  // Material Properties > Mechanical
  "Elasticity": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Elasticity of the material (elastic modulus, average) in Pascal",
    "visibility": "main",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Elasticity distribution graph": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Distribution of stiffnesses (elastic modulus) (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Elasticity device": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "The device used to measure elasticity, e.g. Nanoindentator, AFM, microCT",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Toughness": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Toughness of the material as measured by Nanoindentator in Pascal",
    "visibility": "additional",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Hardness": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Knoop hardness as measured by Nanoindentator in Pascal",
    "visibility": "main",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Compressive strength": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Compressive strength as measured by mechanical tester in Pascal",
    "visibility": "main",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Compressive strength graph": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Compressive strength as measured by mechanical tester (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Tensile strength": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Tensile strength as measured by mechanical tester in Pascal.",
    "visibility": "main",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Tensile strength graph": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Tensile strength as measured by mechanical tester (graph). Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Rheology": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Rheology (Reynolds number) as measured by rheometer (unitless measure).",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Rheology graph": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Rheology as measured by rheometer (graph). Are data available yes/no?",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Torsion": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Torsion in Pascal as measured by mechanical tester.",
    "visibility": "additional",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Torsion graph": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Torsion as measured by mechanical tester (graph). Are data available yes/no?",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Shear stress": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Shear stress in Pascal as measured by rheometer or mechanical tester.",
    "visibility": "additional",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Shear stress graph": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Shear stress as measured by rheometer or mechanical tester (graph). Are data available yes/no?",
    "visibility": "additional",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Shear stress device": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "The device used to measure shear, e.g. rheometer, mechanical tester",
    "visibility": "hidden",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Bending strength": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Bending strength as measured by mechanical tester in Pascal.",
    "visibility": "main",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
  "Bending strength graph": {
    "category": "Material > Mechanical",
    "dataType": "string",
    "description": "Bending strength as measured by mechanical tester. Are data available yes/no?",
    "visibility": "main",
    "dimensions": "none",
    "preferredUnit": "none"
  },
  "Stress rupture": {
    "category": "Material > Mechanical",
    "dataType": "double",
    "description": "Stress rupture as measued by mechanical tester in Pascal.",
    "visibility": "additional",
    "dimensions": "pressure",
    "preferredUnit": "pascal"
  },
};

function isTranscriptomicsAssayDetail(fieldName: string): boolean {
  return fieldName.startsWith("Transcriptomics Assay Detail: ")
}
const TRANSCRIPTOMIC_ASSY_DETAIL_DEFAULT_METADATA: FieldMeta = {
  description: "",
  visibility: "main",
  category: "Technical",
  dataType: "string",
  dimensions: "none",
  preferredUnit: "none"
};

interface FieldAnalysisResults {
  fieldName: string,
  isUnitful: boolean,
  looksNumeric: boolean,
  possibleDimensions: string[]
};

interface UploadsResponse {
  upload_uuid: string,
  status: string,
  location: string,
  fieldNames: string[],
  knownFields: { [fieldName: string]: FieldMeta },
  unknownFields: string[],
  fieldAnalyses: FieldAnalysisResults[]
}

@Component({
  selector: 'field-metadata-form',
  template: `
    <div [formGroup]="_form">
    
      <div *ngFor="let fieldName of fieldNames" [formGroupName]="fieldName" class="panel panel-primary">
        <div class="panel-heading">
          <h4>{{ fieldName }}</h4> 
        </div>
        
        <div class="panel-body">
          <div class="form-horizontal">
            <div class="form-group">
              <label [attr.for]="'description-' + fieldName" class="col-sm-2 control-label">
                Description
              </label>
              <div class="col-sm-10">
                <textarea formControlName="description"
                          [id]="'description-' + fieldName"
                          class="form-control"
                          rows="3">
                </textarea>
              </div>
            </div>
                  
            <div class="form-group">
              <label [attr.for]="dataType + fieldName" class="col-sm-2 control-label">
                Data Type
              </label>
              <div class="col-sm-4">
                <select [id]="dataType + fieldName"
                        formControlName="dataType"
                        class="form-control"
                        >
                  <option value="string">String (text)</option>
                  <option value="double">Number</option>
                </select>
              </div>
            </div>
                   
            <div class="form-group">
              <label [attr.for]="'visibility-' + fieldName" class="col-sm-2 control-label">
                Visibility
              </label>
              <div class="col-sm-4">
                <select [id]="'visibility-' + fieldName"
                        formControlName="visibility"
                        class="form-control">
                  <option value="main">Main Filters</option>
                  <option value="additional">Additional Filters</option>
                  <option value="hidden">Hidden</option>
                </select>
              </div>
            </div>
            
            <div class="form-group">
              <label [attr.for]="'category-' + fieldName" class="col-sm-2 control-label">
                Category
              </label>
              <div class="col-sm-4">
                <select [id]="'category-' + fieldName"
                        formControlName="category"
                        class="form-control">
                  <option value="Material > General">Material Properties - General</option>
                  <option value="Material > Chemical">Material Properties - Chemical</option>
                  <option value="Material > Physical">Material Properties - Physical</option>
                  <option value="Material > Mechanical">Material Properties - Mechanical</option>
                  <option value="Biological">Biological Properties</option>
                  <option value="Technical">Technical Properties</option>
                </select>
              </div>
            </div>
            
            <div *ngIf="fieldConfigs[fieldName].possibleDimensions.length > 0">
              <div class="form-group">
                <label [attr.for]="'dimensions-' + fieldName" class="col-sm-2 control-label">
                  Dimensions
                </label>
                <div class="col-sm-4">
                  <select *ngIf="fieldConfigs[fieldName].possibleDimensions.length !== 1"
                          [id]="'dimensions-' + fieldName"
                          formControlName="dimensions"
                          class="form-control">
                    <option *ngFor="let dimension of fieldConfigs[fieldName].possibleDimensions"
                            [value]="dimension"
                            >{{ dimension }}</option>
                  </select>
                  <p *ngIf="fieldConfigs[fieldName].possibleDimensions.length === 1" class="form-control-static">
                    {{ fieldConfigs[fieldName].possibleDimensions[0] }}
                  </p>
                </div>
              </div>
              
              <div class="form-group">
                <label [attr.for]="'preferredUnit-' + fieldName" class="col-sm-2 control-label">
                  Preferred Unit
                </label>
                <div class="col-sm-4">
                  <select *ngIf="possibleUnits(fieldName).length !== 1"
                          [id]="'preferredUnit-' + fieldName"
                          formControlName="preferredUnit"
                          class="form-control">
                    <option *ngFor="let unitName of possibleUnits(fieldName)"
                            [value]="unitName"
                            >{{ uiUnitName(fieldName, unitName) }}</option>
                  </select>
                  <p *ngIf="possibleUnits(fieldName).length === 1" class="form-control-static">
                    {{ uiUnitName(fieldName, possibleUnits(fieldName)[0]) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class FieldMetadataFormComponent implements OnInit, OnChanges {
  @Input() fieldNames: string[] = []
  @Input() fieldAnalyses: { [fieldName: string]: FieldAnalysisResults } = {};
  @Output() form = new EventEmitter<FormGroup>();
  _form: FormGroup;

  fieldConfigs: {[fieldName: string]: any} = {};

  ngOnInit() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  ngOnChanges() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  possibleUnits(fieldName: string): string[] {
    if (this.fieldAnalyses[fieldName]) {
      let dimensions = (<FormGroup>this._form.controls[fieldName]).controls['dimensions'].value;
      return DimensionsRegister[dimensions].getPossibleUnits();
    } else {
      return [];
    }
  }

  uiUnitName(fieldName: string, unitName: string): string {
    if (this.fieldAnalyses[fieldName]) {
      let dimensions = (<FormGroup>this._form.controls[fieldName]).controls['dimensions'].value;
      return DimensionsRegister[dimensions].getUnitUIName(unitName);
    } else {
      return unitName;
    }
  }

  makeFormGroup(): FormGroup {
    let group: any = {};

    this.fieldConfigs = {};
    for (let fieldName of this.fieldNames) {
      let defaults = this.fetchDefaults(fieldName);

      group[fieldName] = new FormGroup({
        fieldName:     new FormControl(fieldName),
        description:   new FormControl(defaults.description, Validators.required),
        category:      new FormControl(defaults.category),
        visibility:    new FormControl(defaults.visibility),
        dataType:      new FormControl(defaults.dataType),
        dimensions:    new FormControl(defaults.dimensions || 'none'),
        preferredUnit: new FormControl(defaults.preferredUnit || 'none'),
      });

      let fieldAnalysis = this.fieldAnalyses[fieldName];

      let fieldConfig: any = this.fieldConfigs[fieldName] = {
        possibleDimensions: (fieldAnalysis && fieldAnalysis.possibleDimensions) || []
      };
    }
    return new FormGroup(group);
  }

  fetchDefaults(fieldName: string): FieldMeta {

    let result: FieldMeta = {
      description:   '',
      dataType:      'string',
      visibility:    'additional',
      category:      'Technical',
      dimensions:    'none',
      preferredUnit: 'none'
    };

    let fieldAnalysis = this.fieldAnalyses[fieldName];
    if (fieldAnalysis) {
      result.dataType = fieldAnalysis.looksNumeric ? "double" : "string";
      if (fieldAnalysis.isUnitful && fieldAnalysis.possibleDimensions) {
        result.dimensions = <DimensionsType> fieldAnalysis.possibleDimensions[0];
        result.preferredUnit = DimensionsRegister[result.dimensions].canonicalUnit;
      }
    }

    if (fieldName in KNOWN_METADATA_FIELDS) {
      result = _.merge(result, KNOWN_METADATA_FIELDS[fieldName]);
    } else if (isTranscriptomicsAssayDetail(fieldName)) {
      result = _.merge(result, TRANSCRIPTOMIC_ASSY_DETAIL_DEFAULT_METADATA);
    }

    return result;
  }
}

@Component({
  template: `
  <div class="container">
    <h1>Upload New Study</h1>
    
    <div [class.hidden]="step !== 1">
      <h2>Step 1: Upload a .zip archive in ISAtab format</h2>
      <div [class.disabled]="uploadFileChooserDisabled">
        <div ng2FileDrop
             [ngClass]="{'nv-file-over': hasBaseDropZoneOver}"
             (fileOver)="fileOverBase($event)"
             [uploader]="uploader"
             class="well my-drop-zone"
             style="display: inline-block">
             Drag a file here
        </div>
        or select a file here: <input type="file" ng2FileSelect [uploader]="uploader" [disabled]="uploadFileChooserDisabled"/>
      </div>
      <p>
        <b>File to upload: </b>{{ uploadFileName }}
      </p>
      <div>
        Then click here: <button type="button" (click)="doUpload()" [disabled]="!uploader.getNotUploadedItems().length">Upload</button>
        <div>
          Progress:
          <div class="w3-progress-container">
            <div class="w3-progressbar" role="progressbar" [ngStyle]="{ 'width': progress + '%' }"></div>
          </div>
          <span *ngIf="status">Status: {{ status }}</span>
        </div>
      </div>
    </div>
    
    <div [class.hidden]="step !== 2">
      <h2>Step 2: Enter metadata for new fields</h2>
      
      <div *ngIf="!unknownFields">
        No new fields in this study
      </div>
      
      <div *ngIf="unknownFields">
        <field-metadata-form [fieldNames]="unknownFields" [fieldAnalyses]="fieldAnalyses" (form)="metadataForm = $event"></field-metadata-form>
      </div>
      
      <button type="button" [disabled]='uploadConfirmationSent' (click)="doConfirmMetadata()">{{ confirmMetadataButtonName }}</button>
    </div>
    
    <div *ngIf="step === 3">
      <h2>Upload succeeded!</h2>
      <study [studyId]="upload_uuid" [showTitle]="true"></study>
    </div>
    
    <div *ngIf="step === 4">
      <h2>Upload failed!</h2>
      <div class="alert alert-danger">
        {{ errorMessage }}
      </div>
    </div>
  </div>
  `,

  // Adapted from W3.css for prototype (http://www.w3schools.com/w3css/default.asp)
  // ...and from Bootstrap
  // ...and from the ng2-file-uploader example
  styles: [`
    .well{min-height:20px;padding:19px;margin-bottom:20px;background-color:#f5f5f5;border:1px solid #e3e3e3;border-radius:4px;-webkit-box-shadow:inset 0 1px 1px rgba(0,0,0,.05);box-shadow:inset 0 1px 1px rgba(0,0,0,.05)}
    .my-drop-zone { border: dotted 3px lightgray; }
    .nv-file-over { border: dotted 3px red; } /* Default class applied to drop zones on over */
    .w3-progress-container{width:200px;height:1.5em;position:relative;background-color:#f1f1f1;display:inline-block}
    .w3-progressbar{background-color:#757575;height:100%;position:absolute;line-height:inherit}
    .disabled { color: rgb(128, 128, 128) }
    .disabled .well { background-color:#fcfcfc }
    .hidden { display: none }
  `]
})
export class UploadComponent {

  public uploader: MyFileUploader = new MyFileUploader(this, {
    url: URL,
    method: 'POST',
    queueLimit: 1,
    disableMultipart: true  // Send the file body directly as request body, don't wrap it in any way
  });
  public hasBaseDropZoneOver: boolean = false;
  uploadFileName: string = "<None>"
  status = '';
  progress = 0;
  uploadFileChooserDisabled = false;
  step = 1;
  upload_uuid = '';
  confirm_upload_url = '';
  confirmMetadataButtonName = 'Confirm Upload';
  uploadConfirmationSent = false;
  fieldNames: string[] = []
  knownFields: {[fieldName: string]: FieldMeta} = {};
  unknownFields: string[] = [];
  fieldAnalyses: {[fieldName: string]: FieldAnalysisResults} = {};
  metadataForm: FormGroup;
  errorMessage: string = "";

  constructor(
    private _router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  fileOverBase(e:any):void {
    this.hasBaseDropZoneOver = e;
  }

  onFileAdded(filename: string): void {
    this.uploadFileName = filename;
    this.changeDetectorRef.detectChanges();
  }

  doUpload(): void {
    this.uploadFileChooserDisabled = true;
    this.uploader.uploadAll();
  }

  onUploadProgress(progress: any): void {
    this.progress = progress;
    this.changeDetectorRef.detectChanges();
  }

  withoutStar(s: string): string {
    if (s.substr(0, 1) === '*') {
      return s.substr(1);
    } else {
      return s;
    }
  }

  onUploadSuccess(response: string, status: number, headers: ParsedResponseHeaders): void {
    let jResponse: UploadsResponse = JSON.parse(response);
    this.upload_uuid = jResponse.upload_uuid;
    this.confirm_upload_url = jResponse.location;
    this.fieldNames = jResponse.fieldNames;
    this.knownFields = jResponse.knownFields;
    this.unknownFields = jResponse.unknownFields.sort(
      (a: string, b:string) => this.withoutStar(a).localeCompare(this.withoutStar(b))
    );//.filter((a: string) => a.substr(0, 1) !== '*');
    this.fieldAnalyses = {}
    for (let fieldAnalysis of jResponse.fieldAnalyses) {
      this.fieldAnalyses[fieldAnalysis.fieldName] = fieldAnalysis;
    }

    // Reject archives with invalid units
    let fieldsWithUnrecognizedUnits: string[] = [];
    for (let fieldName in this.fieldAnalyses) {
      let fieldAnalysis = this.fieldAnalyses[fieldName];
      if (fieldAnalysis.possibleDimensions.length === 1 && fieldAnalysis.possibleDimensions[0] === INVALID_DIMENSIONS) {
        fieldsWithUnrecognizedUnits.push(fieldName);
      }
    }
    if (fieldsWithUnrecognizedUnits.length > 0) {
      this.step = 4;
      this.errorMessage = `The following fields have unrecognized units: ${JSON.stringify(fieldsWithUnrecognizedUnits)}`;
      return;
    }

    // Otherwise, move onto next step
    this.step = 2;
  }

  onUploadFailure(response: string, status: number, headers: ParsedResponseHeaders): void {
    this.step = 4;
    this.errorMessage = `[Technical details: status=${status}, response='${response}'`;
  }

  doConfirmMetadata() {
    let that = this;

    let newMetadata = Object.values(this.metadataForm.value);
    let metadataInsertionPromise: Promise<null>;
    if (!newMetadata || newMetadata.length === 0) {
      metadataInsertionPromise = Promise.resolve([]);
    } else {
      metadataInsertionPromise = new Promise((resolve, reject) => {
        $.ajax({
          type: 'PUT',
          url: 'http://localhost:23456/metadata/fields/_multi',
          data: JSON.stringify(newMetadata),
          dataType: 'json',
          success: function(response) {
            resolve();
          },
          error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
            that.errorMessage = `Failed to create new fields: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`;
            that.step = 4;
            that.changeDetectorRef.detectChanges();
            reject();
          }
        })
      });
    }

    metadataInsertionPromise.then(() => {
      $.ajax({
        type: 'PUT',
        url: this.confirm_upload_url,
        contentType: 'text/plain',  // TODO: Use JSON when sending metadata confirmations
        success: function(data:any, textStatus:string, jqXHR: XMLHttpRequest) {
          that.step = 3;
          that.changeDetectorRef.detectChanges();
        },
        error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
          that.errorMessage = `Details ${JSON.stringify({textStatus, errorThrown})}`;
          that.step = 4;
          that.changeDetectorRef.detectChanges();
        },
      });
    });

    this.confirmMetadataButtonName = "Confirming Upload...";
    this.uploadConfirmationSent = true;
  }
}

class MyFileUploader extends FileUploader {
  constructor(private component: UploadComponent, options: FileUploaderOptions) {
    super(options);
  }

  onAfterAddingFile(fileItem:any /*FileItem*/): any {
    this.component.onFileAdded(fileItem.file.name);
  }

  onProgressAll(progress:any) {
    this.component.onUploadProgress(progress);
  }

  onSuccessItem(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
    this.component.onUploadSuccess(response, status, headers);
  }

  onErrorItem(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
    this.component.onUploadFailure(response, status, headers);
  }

  onCancelItem(item:any /*FileItem*/, response:string, status:number, headers:ParsedResponseHeaders):any {
    this.component.onUploadFailure(response, status, headers);
  }
}
