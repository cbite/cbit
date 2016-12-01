import {Component, OnInit, ChangeDetectorRef, Input, Output, OnChanges, EventEmitter} from '@angular/core';
import {Router} from "@angular/router";
import {
  FileUploader, FileSelectDirective, FileDropDirective,
  ParsedResponseHeaders, FileUploaderOptions
} from 'ng2-file-upload/ng2-file-upload';
//import { FileItem } from 'ng2-file-upload/components/file-upload/file-item.class'
import * as $ from 'jquery';
import {FieldMeta} from "../common/field-meta.model";
import {FormGroup, FormControl, Validators, RequiredValidator} from "@angular/forms";

// Heavily adapted from here:
// http://valor-software.com/ng2-file-upload/

const URL = 'http://localhost:23456/uploads';

const KNOWN_METADATA_FIELDS: { [fieldName: string]: FieldMeta } = {

  // Technical properties
  "Gene expression type": {
    "category": "Technical",
    "data_type": "string",
    "description": "Gene expression tehcnology used for the samples, e.g. Microarray, RNA sequencing. Use OBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main"
  },
  "Platform": {
    "category": "Technical",
    "data_type": "string",
    "description": "Type of platform used, e.g. Illumina, Affymetrix, Agilent. Use OBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main"
  },
  "Array or chip design": {
    "category": "Technical",
    "data_type": "string",
    "description": "The design of the microarray or RNAseq chip, e.g. Illumina HT12v4",
    "visibility": "main"
  },

  // Biological properties
  "Source Name": {
    "category": "Biological",
    "data_type": "string",
    "description": "The source is the study ID, i.e. the source where samples come from.",
    "visibility": "hidden"
  },
  "Barcode": {
    "category": "Biological",
    "data_type": "string",
    "description": "Barcode of microarray or RNAseq chip, including location of array or lane the sample was placed on, e.g. 123456789-A is a microarray with code 123456789 where the sample was placed on position A.",
    "visibility": "hidden"
  },
  "Study ID": {
    "category": "Biological",
    "data_type": "string",
    "description": "The Study ID (should be a number) that identifies the study.",
    "visibility": "hidden"
  },
  "Group ID": {
    "category": "Biological",
    "data_type": "string",
    "description": "The group ID (should be a number) that identifies a group of samples receiving the same treatment within a study. E.g. all samples exposed to compound X at dose Y for time span Z.",
    "visibility": "hidden"
  },
  "Biological Replicate": {
    "category": "Biological",
    "data_type": "string",
    "description": "Biological replicate ID. Put 1 for all samples if there are no biological replicates, otherwise use a number for each replicate group (required)",
    "visibility": "hidden"
  },
  "Technical Replicate": {
    "category": "Biological",
    "data_type": "string",
    "description": "Technical replicate ID. Leave blank if there are no technical replicates, otherwise use a number for each technical replicate group.",
    "visibility": "hidden"
  },
  "Sample ID": {
    "category": "Biological",
    "data_type": "string",
    "description": "The Sample ID describes each sample in a unique way within each study. It consists of a study ID, a group ID and a biological replicate ID (and when available, a technical replicate ID), separated by dashes. E.g.: 5-2-1 meaning study 5, group 2, bioreplicate 1.",
    "visibility": "hidden"
  },

  "Cell strain abbreviation": {
    "category": "Biological",
    "data_type": "string",
    "description": "Abbreviation of cell line name for cell line work or donor abbreviation (e.g. a human stem cell donor), CLO term when available (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main"
  },
  "Cell strain full name": {
    "category": "Biological",
    "data_type": "string",
    "description": "Full name of cell line name for cell line work or donor abbreviation (e.g. a human stem cell donor).",
    "visibility": "main"
  },
  "Animal strain": {
    "category": "Biological",
    "data_type": "string",
    "description": "The name of the animal strain used for in vivo experiments.",
    "visibility": "main"
  },
  "Cell type": {
    "category": "Biological",
    "data_type": "string",
    "description": "Type of cells (not cell line), e.g. bone marrow cells, osteosarcoma cells, etc.",
    "visibility": "main"
  },
  "Tissue": {
    "category": "Biological",
    "data_type": "string",
    "description": "Type of tissue the sample comes from, choose between: epithelium, connective, muscular, or nervous.",
    "visibility": "main"
  },
  "Organ": {
    "category": "Biological",
    "data_type": "string",
    "description": "Organ from which the sample originates, UBERON term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main"
  },
  "Organism": {
    "category": "Biological",
    "data_type": "string",
    "description": "Provide taxonomic information for the source sample, NCBITaxon term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main"
  },
  "Sex": {
    "category": "Biological",
    "data_type": "string",
    "description": "Sex (sex of original source, male/female). unknown if not known or when a pool of cells is used with multiple sexes.",
    "visibility": "main"
  },
  "Age": {
    "category": "Biological",
    "data_type": "string",
    "description": "Age of animal or human subject in case of in vivo or ex vivo studies.",
    "visibility": "main"
  },
  "Age Unit": {
    "category": "Biological",
    "data_type": "string",
    "description": "Age Unit, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Passage number": {
    "category": "Biological",
    "data_type": "string",
    "description": "The passage number of the cell line at which the experiments took place (in case of in vitro experiments).",
    "visibility": "additional"
  },
  "Assay Type": {
    "category": "Biological",
    "data_type": "string",
    "description": "Type of assay (in vitro, in vivo or ex vivo) (required)",
    "visibility": "main"
  },
  "Culture medium": {
    "category": "Biological",
    "data_type": "string",
    "description": "The type of culture medium used (use standard abbreviation, but no special characters).",
    "visibility": "additional"
  },
  "Attach Duration": {
    "category": "Biological",
    "data_type": "string",
    "description": "Time allowed for cell attachment before start of compound exposure and/or start of culture duration experiment.",
    "visibility": "additional"
  },
  "Attach Duration Unit": {
    "category": "Biological",
    "data_type": "string",
    "description": "Attachment time Unit, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Control": {
    "category": "Biological",
    "data_type": "string",
    "description": "Control flag, is a sample a control or not (true or false) (required)",
    "visibility": "hidden"
  },
  "Sample Match": {
    "category": "Biological",
    "data_type": "string",
    "description": "Sample name of the matching control sample (leave empty if no control is linked to this sample). The sample match does not necessarily mean that the matching control is paired (in the statistical sense). If it is paired, this is indicated in the field Paired sample.",
    "visibility": "hidden"
  },
  "Paired sample": {
    "category": "Biological",
    "data_type": "string",
    "description": "Is the sample paired to another sample? (relevant for statistical purposes) A group (minimal of two samples) that is paired should be indicated with the same letter (e.g. A for the first group of paired samples, B for the second, etc.). Leave blank if samples are not paired.",
    "visibility": "hidden"
  },
  "Compound": {
    "category": "Biological",
    "data_type": "string",
    "description": "Compound Name for exposure study, CHEBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "main"
  },
  "Compound abbreviation": {
    "category": "Biological",
    "data_type": "string",
    "description": "Compound abbreviation",
    "visibility": "main"
  },
  "CAS number": {
    "category": "Biological",
    "data_type": "string",
    "description": "Compound CAS (Chemical Abstracts Service) number",
    "visibility": "additional"
  },
  "Dose": {
    "category": "Biological",
    "data_type": "string",
    "description": "Dose per administration",
    "visibility": "main"
  },
  "Dose Unit": {
    "category": "Biological",
    "data_type": "string",
    "description": "Dose Unit, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Dose Duration": {
    "category": "Biological",
    "data_type": "string",
    "description": "Duration of dose treatment; only for compound exposure study",
    "visibility": "main"
  },
  "Dose Duration Unit": {
    "category": "Biological",
    "data_type": "string",
    "description": "Duration of dose treatment Unit; only for compound exposure study, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Dose Frequency": {
    "category": "Biological",
    "data_type": "string",
    "description": "Dose frequency; only for repeat dose toxicity study",
    "visibility": "additional"
  },
  "Vehicle": {
    "category": "Biological",
    "data_type": "string",
    "description": "Vehicle used to dilute the compound (water, dimethyl sulfoxide, etc.), CHEBI term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "additional"
  },
  "Route": {
    "category": "Biological",
    "data_type": "string",
    "description": "Administration route (gavage, injection, etc.), ERO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "additional"
  },
  "Culture Duration": {
    "category": "Biological",
    "data_type": "string",
    "description": "Culture time on biomaterial (after attachment) until isolation of cells",
    "visibility": "main"
  },
  "Culture Duration Unit": {
    "category": "Biological",
    "data_type": "string",
    "description": "Culture time Unit, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Biomaterial graphs file": {
    "category": "Biological",
    "data_type": "string",
    "description": "Name (or URI) of the file that contains the biomaterial characteristics displayed as a graph or image",
    "visibility": "hidden"
  },
  "Protocol REF": {
    "category": "Biological",
    "data_type": "string",
    "description": "Internal ISAtab protocol references",
    "visibility": "hidden"
  },
  "Sample Name": {
    "category": "Biological",
    "data_type": "string",
    "description": "A unique name for each of your samples after all treatments described here (required). The microarray barcode is the best option here.",
    "visibility": "hidden"
  },

  // Material Properties > General
  "Material Class": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Class of material. E.g.: ceramic, metal, polymer, composite, natural graft",
    "visibility": "main"
  },
  "Material Name": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Full name of the type of material",
    "visibility": "main"
  },
  "Material abbreviation": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Abbreviation of the type of material",
    "visibility": "main"
  },
  "Material Shape": {
    "category": "Material > General",
    "data_type": "string",
    "description": "The shape of the material. Choose from: flat (for polystyrene culture flasks/dishes/plates), particle, disc, cylinder, block, coating, paste/injectable, cement, hydrogel",
    "visibility": "main"
  },
  "Sintering temperature": {
    "category": "Material > General",
    "data_type": "number",
    "description": "Sintering temperature of the material in degree Celsius.",
    "visibility": "main"
  },
  "Sintering temperature Unit": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Sintering temperature unit. Should be the UO term \"degree Celsius\".",
    "visibility": "unit"
  },
  "Manufacturer": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Manufacturer of the material",
    "visibility": "additional"
  },
  "Etching": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Type of etching process used on material",
    "visibility": "additional"
  },
  "Coating": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Type of coating applied on base material",
    "visibility": "additional"
  },
  "Clinically applied": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Has the material been clinically applied? (in this or other studies) yes/no",
    "visibility": "additional"
  },
  "Biologically degradable": {
    "category": "Material > General",
    "data_type": "string",
    "description": "Is the material biologically degradable? yes/no",
    "visibility": "additional"
  },

  // Material Properties > Chemical
  "Phase composition": {
    "category": "Material > Chemical",
    "data_type": "number",
    "description": "Percentage (%) of each phase in the material, separated by semi-colons, e.g.: TCP=80;HA=20",
    "visibility": "main"
  },
  "Phase composition Unit": {
    "category": "Material > Chemical",
    "data_type": "number",
    "description": "Phase composition unit. This should be percent: %",
    "visibility": "unit"
  },
  "Phase composition device": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "The device used to measure the phase composition, e.g. XRD, EDS",
    "visibility": "hidden"
  },
  "Elements composition": {
    "category": "Material > Chemical",
    "data_type": "number",
    "description": "Element concentrations in material in parts per million (ppm) as measured by ICP-MS, separated by semi-colon, e.g.: Ca=800;P=400",
    "visibility": "main"
  },
  "Elements composition Unit": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "Elements composition unit. Should be the UO term \"parts per million\".",
    "visibility": "unit"
  },
  "Elements composition device": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "The device used to measure the elements composition (e.g. ICP-MS or EDS).",
    "visibility": "hidden"
  },
  "Elements composition graph": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "Elements composition of the surface as measured by EDS: a graph plotting the intensity (counts) versus the energy (keV). Are data available yes/no?",
    "visibility": "main"
  },
  "Molecular structure graph": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "The molecular structure of the material as determined by FTIR (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Degradation/ion release graph": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "Degradation or ion release in for example SPS, SBF, PBS, water, medium (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Degradation/ion release device": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "The device used to measure degradation/ion release, e.g. ICP-MS, colorimetric methods",
    "visibility": "hidden"
  },
  "Molecular weight graph": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "The distribution of molecular weight as measured by GPC (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Corrosion graph": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "The amount of oxide formed in SPS, SBF, PBS, water, medium (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Corrosion device": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "The device used to measure corrosion, e.g. EDS, ICP-MS",
    "visibility": "hidden"
  },
  "Weight loss": {
    "category": "Material > Chemical",
    "data_type": "number",
    "description": "The weight loss of the material per time Unit",
    "visibility": "main"
  },
  "Weight loss Unit": {
    "category": "Material > Chemical",
    "data_type": "string",
    "description": "Weight loss Unit, percentage/time Unit, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },

  // Material Properties > Physical
  "Crystallinity": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "The percentage (%) of amorphous/crystalline material",
    "visibility": "main"
  },
  "Crystallinity Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Crystallinity unit. Should be percent: %",
    "visibility": "unit"
  },
  "Crystallinity device": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The device used to measure the crystallinity, e.g. XRD, SAXS/WAXS",
    "visibility": "hidden"
  },
  "Crystal structure": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Crystal structure (categorical), followed by lattice parameters (a,b,c), e.g.: hexagonal;(3,5,7)",
    "visibility": "main"
  },
  "Porosity": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "The percentage of porosity of the material",
    "visibility": "main"
  },
  "Porosity Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Porosity unit. Should be percent: %",
    "visibility": "unit"
  },
  "Porosity device": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "The device used to measure the porosity, e.g. microCT, mercury intrusion",
    "visibility": "hidden"
  },
  "Pore size": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "Pore diameter size",
    "visibility": "main"
  },
  "Pore size Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Pore size Unit, e.g. micrometer, nanometer, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Pore size device": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The device used to measure the pore size, e.g. microCT, SEM, profilometer",
    "visibility": "hidden"
  },
  "Grain size": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "The grain size of the material as measured by SEM.",
    "visibility": "main"
  },
  "Grain size Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Grain size Unit, e.g. nanometer, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Grain size device": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The device used to measure grain size, e.g. SEM, XRD",
    "visibility": "hidden"
  },
  "Surface roughness Ra": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Surface roughness, average profile roughness parameter Ra in micrometers",
    "visibility": "main"
  },
  "Surface roughness Ra Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Surface roughness Ra unit, should probably be micrometer, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Surface roughness Sa": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Surface roughness, average area roughness parameter Sa in micrometers",
    "visibility": "main"
  },
  "Surface roughness Sa Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Surface roughness Sa unit, should probably be micrometer, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Surface roughness graph": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Surface roughness (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Surface roughness device": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The device used to measure surface roughness, e.g. microCT, profilometer",
    "visibility": "hidden"
  },
  "Specific surface area": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "Specific surface area of the material",
    "visibility": "main"
  },
  "Specific surface area Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Specific surface area Unit, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Specific surface area device": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The device used to measure the specific surface area, e.g. BET, Gas absorption",
    "visibility": "hidden"
  },
  "Wettability": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "Wettability of the material (contact angle in degrees) with a liquid measured with contact angle device.Write down as e.g. water=45;ethanol=60",
    "visibility": "main"
  },
  "Wettability Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Wettability unit. Should be \"degree\", UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Surface charge": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "The surface charge of the material measured as zeta potential (in millivolt).",
    "visibility": "additional"
  },
  "Surface charge Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Surface charge unit, probably millivolts, use UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Surface charge device": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The device used to measure the surface charge, e.g. DLS, M3-PALS",
    "visibility": "hidden"
  },
  "Density graph": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Distribution of densities as measured by microCT (graph). Are data available yes/no?",
    "visibility": "additional"
  },
  "Alignment of crystals": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "Alignment of crystals in a polymer as measured by SAXS/WAXS",
    "visibility": "main"
  },
  "Alignment of crystals Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Alignment of crystals unit. ",
    "visibility": "unit"
  },
  "Polymerization mechanism": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The mechanism of polymerization, e.g. condensation polymerization, addition (chain-growth) polymerization, ring opening polymerization, etc.",
    "visibility": "additional"
  },
  "Crosslinking degree": {
    "category": "Material > Physical",
    "data_type": "number",
    "description": "Degree of crosslinking (%)",
    "visibility": "main"
  },
  "Crosslinking degree Unit": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Crosslinking degree unit, should be percent: %",
    "visibility": "unit"
  },
  "Crosslinking degree device": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "The device used to measure the degree of crosslinking, e.g. XRD, SAXS/WAXS, rheometer",
    "visibility": "hidden"
  },
  "Homogeneity of ceramic distribution": {
    "category": "Material > Physical",
    "data_type": "string",
    "description": "Homogeneity of ceramic distribution in composite materials, i.e. are ceramic particles distributed homogenously or do they form aggregates? yes/no respectively",
    "visibility": "additional"
  },

  // Material Properties > Mechanical
  "Elasticity": {
    "category": "Material > Mechanical",
    "data_type": "number",
    "description": "Elasticity of the material (elastic modulus, average) in Pascal",
    "visibility": "main"
  },
  "Elasticity Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Elasticity unit (elastic modulus, average), probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Elasticity distribution graph": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Distribution of stiffnesses (elastic modulus) (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Elasticity device": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "The device used to measure elasticity, e.g. Nanoindentator, AFM, microCT",
    "visibility": "hidden"
  },
  "Toughness": {
    "category": "Material > Mechanical",
    "data_type": "number",
    "description": "Toughness of the material as measured by Nanoindentator in Pascal",
    "visibility": "additional"
  },
  "Toughness Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Toughness unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Hardness": {
    "category": "Material > Mechanical",
    "data_type": "number",
    "description": "Knoop hardness as measured by Nanoindentator in Pascal",
    "visibility": "main"
  },
  "Hardness Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Knoop hardness unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Compressive strength": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Compressive strength as measured by mechanical tester in Pascal",
    "visibility": "main"
  },
  "Compressive strength Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Compressive strength unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Compressive strength graph": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Compressive strength as measured by mechanical tester (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Tensile strength": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Tensile strength as measured by mechanical tester in Pascal.",
    "visibility": "main"
  },
  "Tensile strength Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Tensile strength unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Tensile strength graph": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Tensile strength as measured by mechanical tester (graph). Are data available yes/no?",
    "visibility": "main"
  },
  "Rheology": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Rheology (Reynolds number) as measured by rheometer (unitless measure).",
    "visibility": "additional"
  },
  "Rheology graph": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Rheology as measured by rheometer (graph). Are data available yes/no?",
    "visibility": "additional"
  },
  "Torsion": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Torsion in Pascal as measured by mechanical tester.",
    "visibility": "additional"
  },
  "Torsion Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Torsion unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Torsion graph": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Torsion as measured by mechanical tester (graph). Are data available yes/no?",
    "visibility": "additional"
  },
  "Shear stress": {
    "category": "Material > Mechanical",
    "data_type": "number",
    "description": "Shear stress in Pascal as measured by rheometer or mechanical tester.",
    "visibility": "additional"
  },
  "Shear stress Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Shear stress unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Shear stress graph": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Shear stress as measured by rheometer or mechanical tester (graph). Are data available yes/no?",
    "visibility": "additional"
  },
  "Shear stress device": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "The device used to measure shear, e.g. rheometer, mechanical tester",
    "visibility": "hidden"
  },
  "Bending strength": {
    "category": "Material > Mechanical",
    "data_type": "number",
    "description": "Bending strength as measured by mechanical tester in Pascal.",
    "visibility": "main"
  },
  "Bending strength Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Bending strength unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
  "Bending strength graph": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Bending strength as measured by mechanical tester. Are data available yes/no?",
    "visibility": "main"
  },
  "Stress rupture": {
    "category": "Material > Mechanical",
    "data_type": "number",
    "description": "Stress rupture as measued by mechanical tester in Pascal.",
    "visibility": "additional"
  },
  "Stress rupture Unit": {
    "category": "Material > Mechanical",
    "data_type": "string",
    "description": "Stress rupture unit, probably pascal, UO term (use ontology lookup service from EBI: https://www.ebi.ac.uk/ols/index)",
    "visibility": "unit"
  },
};

interface UploadsResponse {
  upload_uuid: string,
  status: string,
  location: string,
  fieldNames: string[],
  knownFields: { [fieldName: string]: FieldMeta },
  unknownFields: string[]
}

@Component({
  selector: 'field-metadata-form',
  template: `
    <div [formGroup]="_form">
    
      <div *ngFor="let fieldName of fieldNames" [formGroupName]="fieldName">
        <h4>{{ fieldName }}</h4>
        
        <label [attr.for]="'description-' + fieldName">Description</label>
        <input formControlName="description"
               [id]="'description-' + fieldName"
               type="textbox">
               
        <label [attr.for]="'data_type-' + fieldName">Data Type</label>
        <select [id]="'data_type-' + fieldName"
                formControlName="data_type">
          <option value="string">String (text)</option>
          <option value="double">Number</option>
        </select>
               
        <label [attr.for]="'visibility-' + fieldName">Visibility</label>
        <select [id]="'visibility-' + fieldName"
                formControlName="visibility">
          <option value="main">Main Filters</option>
          <option value="additional">Additional Filters</option>
          <option value="hidden">Hidden</option>
          <option value="unit">Unit</option>
        </select>
               
        <label [attr.for]="'category-' + fieldName">Category</label>
        <select [id]="'category-' + fieldName"
                formControlName="category">
          <option value="Material > General">Material Properties - General</option>
          <option value="Material > Chemical">Material Properties - Chemical</option>
          <option value="Material > Physical">Material Properties - Physical</option>
          <option value="Material > Mechanical">Material Properties - Mechanical</option>
          <option value="Biological">Biological Properties</option>
          <option value="Technical">Technical Properties</option>
        </select>
      </div>
    </div>
  `
})
export class FieldMetadataFormComponent implements OnInit, OnChanges {
  @Input() fieldNames: string[] = []
  @Output() form = new EventEmitter<FormGroup>();
  _form: FormGroup;

  ngOnInit() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  ngOnChanges() {
    this._form = this.makeFormGroup();
    this.form.emit(this._form);
  }

  makeFormGroup(): FormGroup {
    let group: any = {};
    for (let fieldName of this.fieldNames) {
      let defaults = this.fetchDefaults(fieldName);

      group[fieldName] = new FormGroup({
        description: new FormControl(defaults.description, Validators.required),
        data_type:   new FormControl(defaults.data_type),
        visibility:  new FormControl(defaults.visibility),
        category:    new FormControl(defaults.category)
      });
    }
    return new FormGroup(group);
  }

  fetchDefaults(fieldName: string): FieldMeta {
    if (fieldName in KNOWN_METADATA_FIELDS) {
      return KNOWN_METADATA_FIELDS[fieldName];
    } else {
      return {
        description: '',
        data_type:   'string',
        visibility:  'additional',
        category:    'Technical'
      }
    }
  }
}

@Component({
  template: `
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
    <p>Upload UUID: <code>{{ upload_uuid }}</code></p>
    
    <div *ngIf="!unknownFields">
      No new fields in this study
    </div>
    
    <div *ngIf="unknownFields">
      <field-metadata-form [fieldNames]="unknownFields" (form)="metadataForm = $event"></field-metadata-form>
    </div>
    
    <button type="button" [disabled]='uploadConfirmationSent' (click)="doConfirmMetadata()">{{ confirmMetadataButtonName }}</button>
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
  metadataForm: FormGroup;

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
    if (s.substr(0, 1) == '*') {
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
    );
    this.step = 2;
  }

  onUploadFailure(response: string, status: number, headers: ParsedResponseHeaders): void {
    this.status = `Upload failed!  [Technical details: status=${status}, response='${response}'`;
  }

  doConfirmMetadata() {
    let that = this;

    let newMetadata = this.metadataForm.value;
    let metadataInsertionPromise: Promise<null>;
    if (!newMetadata) {
      metadataInsertionPromise = Promise.resolve([]);
    } else {
      let promises: Promise<null>[] = [];
      for (let fieldName in newMetadata) {
        let promise = new Promise((resolve, reject) => {
          $.ajax({
            type: 'PUT',
            url: `http://localhost:23456/metadata/fields/${fieldName}`,
            contentType: 'application/json',
            data: JSON.stringify(newMetadata[fieldName]),
            success: function(response) {
              resolve();
            },
            error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
              console.log(`Failed to update metadata for ${fieldName}: ${textStatus}, ${errorThrown}, ${jqXHR.responseText}!`);
              reject();
            }
          });
        });
        promises.push(promise);
      }
      metadataInsertionPromise = Promise.all(promises);
    }

    metadataInsertionPromise.then(() => {
      $.ajax({
        type: 'PUT',
        url: this.confirm_upload_url,
        contentType: 'text/plain',  // TODO: Use JSON when sending metadata confirmations
        error: function(jqXHR: XMLHttpRequest, textStatus: string, errorThrown: string) {
          that.status = `Confirmation Error!  Details ${JSON.stringify({textStatus, errorThrown})}`;
          that.changeDetectorRef.detectChanges();
        },
        success: function(data:any, textStatus:string, jqXHR: XMLHttpRequest) {
          that._router.navigate(['/study', that.upload_uuid]);
        }
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
