# -*- coding: utf-8 -*-

# TODO: Make sure all calls to format use unicode strings
# i.e., '{0} - {1}'.format(outResult[abbrevField], outResult[nameField])
# should be u'{0} - {1}'.format(outResult[abbrevField], outResult[nameField])

import os.path
import itertools
import pandas as pd
import re
import numpy as np
import config.config as cfg
from unit_conversions import UnitConverter, DimensionsRegister
from data.fieldmeta import FieldMeta
import json

# Explicit list of NA-like values.  We'd originally talked about rejecting
# any blank fields (to require "N/A", "None" or "unknown"), but this turns out
# to be a bad idea.  Pandas simply changes the type of the column to "string"
# to accomodate empty strings, which causes type-conversion issues downstream.
# So we'll accept blanks after all and treat them as N/A.
#
# This list extends pandas' built-in list with cBiT-specific values
NA_VALUES = set([
    'N/A', 'None', 'none', 'Unknown', 'unknown'
])

def read_investigation(f):
    # An investigation file looks like this:
    #
    # SECTION HEADER
    # FieldName <TAB> FieldValue { <TAB> FieldValue }* [<TAB>]
    #
    # Field Values may be quoted, and unfortunately, quoted fields may
    # contain raw newlines in them.  So we need to work to parse these files.
    # (and Pandas' built-in readers, which would usually save the day here,
    # don't react well to files with varying numbers of "columns").
    #
    # TODO: No idea how double quotes are themselves quoted in this format

    s = f.read().decode(cfg.FILE_ENCODING)

    # Token generator
    # Yields either '\t', '\r', '\n', or a string (with quotes removed)
    def tokens():
        in_quote = False
        cur_token_chars = []
        for c in itertools.chain(s, [None]):

            # Handle quoting properly
            if not in_quote and c == '"':
                cur_token_chars.append(c)
                in_quote = True
            elif in_quote and c == '"':
                cur_token_chars.append(c)
                in_quote = False
            elif in_quote:
                cur_token_chars.append(c)

            elif c in ('\t', '\r', '\n', None):
                
                # Emit current token, if any
                if cur_token_chars:
                    
                    # Remove leading and trailing quotes from current token
                    if len(cur_token_chars) > 0 and cur_token_chars[0] == '"':
                        cur_token_chars = cur_token_chars[1:]
                    if len(cur_token_chars) > 0 and cur_token_chars[-1] == '"':
                        cur_token_chars = cur_token_chars[:-1]
                    
                    yield ''.join(cur_token_chars)
                    cur_token_chars = []

                if c in ('\t', '\n'):
                    # Emit delimiter as well
                    yield c

            else:
                # Accumulate token
                cur_token_chars.append(c)

    # Line emitter
    def lines():
        tokensInLine = []
        for token in itertools.chain(tokens(), [None]):
            if token in ('\r', '\n', None):
                if tokensInLine:
                    yield tokensInLine
                    tokensInLine = []
            else:
                tokensInLine.append(token)

    # Section emitter
    def sections():
        contents = {}
        cur_section = None
        for line in itertools.chain(lines(), [None]):

            if line is None or len(line) == 1:
                # New section
                if cur_section:
                    yield (cur_section, contents)
                    contents = {}
                if line is not None:
                    cur_section = line[0]
            else:
                fieldName = line[0]
                values = [v for v in line[1:] if v != '\t']

                if len(values) == 1:
                    value = values[0]
                else:
                    value = values
                contents[fieldName] = value

    # Put everything together
    return {sectionName: contents for sectionName, contents in sections()}


def flatten_investigation(i):
    """
    Take an investigation dictionary as read from disk and flip parallel arrays

    Example:
         turn {"Study Assays": {"Name": ['a', 'b'], "Type": ['x', 'y']}}
         into {"Study Assays": [ {"Name": "a", "Type": "x"},
                                 {"Name": "b", "Type": "y"} ]}
    """
    result = {}

    for k, v in i.iteritems():
        if isinstance(v, dict):
            vs = v.values()
            if all(isinstance(vv, list) for vv in vs):
                # OK, v is a dictionary of parallel arrays, flip it
                numItems = len(vs[0])
                if not all(len(vv) == numItems for vv in vs):
                    raise ValueError("Supposed parallel array in {0} has entries of different length"
                                     .format(k))

                innerResult = [dict() for i in xrange(numItems)]
                for kk, vv in v.iteritems():
                    for i, vvv in enumerate(vv):
                        innerResult[i][kk] = vvv
                result[k] = innerResult

        # If we didn't flip v, copy it to the result as is
        if k not in result:
            result[k] = v

    return result


def remove_empty_values_in_dict(d):
    """Recursively remove entries with empty values, possibly removing whole nested dictionaries"""
    result = {}
    for k, v in d.iteritems():
        if isinstance(v, dict):
            vPrime = remove_empty_values_in_dict(v)
            if vPrime:
                result[k] = vPrime
        elif isinstance(v, list):
            vPrime = [remove_empty_values_in_dict(vv) for vv in v]
            vPrimePrime = [vv for vv in vPrime if len(vv) > 0]
            if vPrimePrime:
                result[k] = vPrimePrime
        elif v != '':
            result[k] = v
    return result


def remove_common_prefixes(d):
    """Recursively remove common prefixes shared by all keys of a dictionary"""

    common_prefix = os.path.commonprefix(d.keys())
    last_space = common_prefix.rfind(' ')
    if last_space != -1:
        common_prefix = common_prefix[:last_space+1]
    i = len(common_prefix)
    result = {}
    for k, v in d.iteritems():
        if isinstance(v, dict):
            result[k[i:]] = remove_common_prefixes(v)
        elif isinstance(v, list):
            result[k[i:]] = [remove_common_prefixes(vv) for vv in v]
        else:
            result[k[i:]] = v
    return result


def remove_isa_name_prefixes(i):
    """Recursively remove useless prefixes inserted by ISAcreator"""

    result = {}
    for k, v in i.iteritems():
        kPrime = re.sub(r'^Comment\[(.*)\]$', r'\1', k)
        if isinstance(v, dict):
            result[kPrime] = remove_isa_name_prefixes(v)
        elif isinstance(v, list):
            result[kPrime] = [remove_isa_name_prefixes(vv) for vv in v]
        else:
            result[kPrime] = v
    return result


def conform_investigation_to_schema(i):
    """Ensure that dictionary values that should be lists are lists, even if single-valued"""

    result = i.copy()
    if 'STUDY PUBLICATIONS' not in result:
        result['STUDY PUBLICATIONS'] = []
    elif not isinstance(result['STUDY PUBLICATIONS'], list):
        result['STUDY PUBLICATIONS'] = [result['STUDY PUBLICATIONS']]

    return result


def read_study_sample(f):
    # A study sample is a regular TSV file, with strings quoted by double-quotes.
    # Fortunately, every line has the same number of columns
    #
    # It describes each sample used in a study (material properties,
    # cell types, reference to control sample, etc.)
    df = pd.read_table(f, encoding=cfg.FILE_ENCODING, na_values=NA_VALUES, dtype=str)
    return df


def clean_up_study_samples(df, db_conn=None):
    # TODO: Really have to refactor this to not use the REST backend DB connection directly

    clean_column_names = [
        re.sub(r'^Factor Value\[(.*)\]$', r'\1',
               re.sub(r'^Characteristics\[(.*)\]$', r'\1', f))
        for f in df.columns.values
    ]

    convertUnits = (db_conn is not None)
    if db_conn:
        with db_conn.cursor() as cur:
            fieldMetas = {
                f.fieldName: f
                for f in FieldMeta.from_db_multi(cur, clean_column_names)
            }  # type: dict[str, FieldMeta]
    else:
        fieldMetas = None

    unit_colnames = {}
    for colname, dirty_colname in zip(clean_column_names, df.columns):
        if colname.endswith('Unit'):
            unit_colnames[colname[:-len('Unit')].strip()] = dirty_colname

    def isFloaty(value):
        try:
            float(value)
            return True
        except ValueError:
            return False

    all_results = {}
    for i, row in df.iterrows():
        result = {}
        protocols = []
        for colname, value in zip(clean_column_names, row):
            if (colname == 'Sample Name'
                or ((fieldMetas is None or (colname in fieldMetas and fieldMetas[colname].dataType == 'double')) and isFloaty(value) and np.isnan(float(value)))):
                pass
            elif colname.startswith('Protocol REF'):
                protocols.append(value)
            elif (convertUnits and colname.endswith('Unit')):
                pass

            # TODO: REALLY, REALLY need to refactor the broken-down fields
            elif (convertUnits and
                  colname not in (u'Phase composition', u'Elements composition', u'Wettability') and
                  colname in fieldMetas and
                  fieldMetas[colname].dimensions != 'none' and
                  fieldMetas[colname].dimensions in DimensionsRegister):

                dimensions = fieldMetas[colname].dimensions
                unit_converter = DimensionsRegister[dimensions]  # type: UnitCoverter
                result[colname] = (
                    unit_converter.toCanonicalUnit(float(value), row[unit_colnames[colname]])
                )
            elif not isFloaty(value) or not np.isnan(float(value)):
                if fieldMetas and colname in fieldMetas and fieldMetas[colname].dataType == 'double' and colname not in ('Phase composition', 'Elements composition', 'Wettability'):
                    result[colname] = float(value)
                else:
                    result[colname] = value

        # Special columns
        result['Protocols'] = ', '.join(protocols)
        all_results[row['Sample Name']] = result

    return all_results


def apply_special_treatments_to_study_sample(d):
    """
    Some keys for the study sample require special treatment:
     * Break down 'Phase composition', 'Elements composition' and 'Wettability'
     * Merge names and abbreviations

    All special fields added are prefixed with '*' to allow
    exclusion in downstream data exports.

    Input dict: Sample Name -> Key -> Value
    """

    def is_float(s):
        try:
            v = float(s)
            return True
        except ValueError:
            return False

    def break_out_composition_like_field(inValueName, outResult, outValueNameTemplate):
        """
        Break out fields like phase composition
        e.g. given a sample with 'Phase composition' TCP=80;HA=20,
        add two extra fields:
        * 'Phase composition - TCP': 80
        * 'Phase composition - HA': 20
        """
        if inValueName in outResult:
            for entry in outResult[inValueName].split(';'):
                # Only for properly formatted fields
                fields = entry.split('=')
                if len(fields) == 2 and is_float(fields[1]):
                    k = fields[0]
                    v = float(fields[1])
                    outResult[outValueNameTemplate.format(k)] = v

    def merge(outResult, nameField, abbrevField, outFieldName):
        if nameField in outResult and abbrevField in outResult:
            outResult[outFieldName] = u'{0} - {1}'.format(outResult[abbrevField], outResult[nameField])

    all_results = {}
    for sampleName, sample in d.iteritems():
        result = sample.copy()

        break_out_composition_like_field(
            'Phase composition', result, '*Phase composition - {0}')
        break_out_composition_like_field(
            'Elements composition', result, '*Elements composition - {0}')
        break_out_composition_like_field(
            'Wettability', result, u'*Wettability - {0}')

        merge(result, 'Material Name', 'Material abbreviation', '*Material')
        merge(result, 'Cell strain full name', 'Cell strain abbreviation', '*Cell strain')
        merge(result, 'Compound', 'Compound abbreviation', '*Compound')

        all_results[sampleName] = result

    return all_results


def read_assay(f):
    # A transcription_micro file describes the technology used to measure
    # gene expression levels in each sample
    df = pd.read_table(f, encoding=cfg.FILE_ENCODING, na_values=NA_VALUES, dtype=str)
    return df


def clean_up_assay(a):
    clean_column_names = [
        re.sub(r'^Parameter Value\[(.*)\]$', r'\1',
               re.sub(r'^Comment\[(.*)\]$', r'\1', f))
        for f in a.columns.values
        ]

    def isFloaty(value):
        try:
            float(value)
            return True
        except ValueError:
            return False

    all_results = {}
    for i, row in a.iterrows():
        sampleName = row['Sample Name']
        result = {}
        for colname, value in zip(clean_column_names, row):
            if (colname == 'Sample Name'
                or (isFloaty(value) and np.isnan(float(value)))
                or value == sampleName
                or colname.startswith('Protocol REF')
                ):
                # Skip empty values or anything that just references the sample
                # again (such references are artifacts of how ISAcreator works)
                # And dump all info about the protocols...
                pass
            else:
                result[colname] = value

        all_results[sampleName] = result

    return all_results


def join_study_sample_and_assay(clean_s, clean_a):
    keys_in_s = set(clean_s.keys())
    keys_in_a = set(clean_a.keys())
    if keys_in_s != keys_in_a:
        raise ValueError('Mismatch between study sample and assay files')
    samples = keys_in_s

    result = {}
    for sample in samples:
        result[sample] = clean_s[sample]
        for k, v in clean_a[sample].iteritems():
            if k not in ('Array Design REF',):
                result[sample][u'Transcriptomics Assay Detail: {0}'.format(k)] = v

    return result

def read_processed_data(f):
    # A processed data file is a flat table of expression strength numbers
    # (in some arbitrary units).  Rows are genes (more precisely, individual
    # probes in the gene chip), columns are samples
    df = pd.read_table(f, index_col=0, encoding=cfg.FILE_ENCODING, dtype='str')
    return df


def read_raw_data(f):
    # A raw data file is a flat table of expression strength numbers
    # (in some arbitrary units).  Rows are genes (more precisely, individual
    # probes in the gene chip), columns are samples (multiple columns per
    # sample, all with names starting with the sample name, followed by a dot '.',
    # followed by a subfield name like 'AVG_Signal', 'Detection Pval', etc.)
    df = pd.read_table(f, index_col=0, encoding=cfg.FILE_ENCODING, dtype='str')
    return df


#def read_annotations(f):
#    # An annotations file is a gene-chip-vendor-provided spec of what each
#    # probe (row in processed data) is actually talking about
#    #
#    # Starts with a bunch of comment lines with descriptions of each column
#    # (ignore for now)
#    df = pd.read_table(f, comment='#', encoding=cfg.FILE_ENCODING, dtype='str')
#    return df
