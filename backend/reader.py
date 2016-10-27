import os.path
import itertools
import pandas as pd
import re
import numpy as np

def read_investigation(cfg, f):
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
            if not in_quote and len(cur_token_chars) == 0 and c == '"':
                in_quote = True
            elif in_quote and c == '"':
                in_quote = False
                yield ''.join(cur_token_chars)
                cur_token_chars = []
            elif in_quote:
                cur_token_chars.append(c)

            elif c in ('\t', '\r', '\n', None):
                # Emit current token, if any
                if cur_token_chars:
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


def read_study_sample(cfg, f):
    # A study sample is a regular TSV file, with strings quoted by double-quotes.
    # Fortunately, every line has the same number of columns
    #
    # It describes each sample used in a study (material properties,
    # cell types, reference to control sample, etc.)
    df = pd.read_table(f, encoding=cfg.FILE_ENCODING)
    return df


def clean_up_study_samples(df):
    clean_column_names = [
        re.sub(r'^Factor Value\[(.*)\]$', r'\1',
               re.sub(r'^Characteristics\[(.*)\]$', r'\1', f))
        for f in df.columns.values
    ]

    def time_to_hour(orig_value, orig_unit):
        if orig_unit in ('hours', 'hour', 'hrs', 'hr', 'h'):
            return orig_value
        elif orig_unit in ('minutes', 'minute', 'mins', 'min', 'm'):
            return orig_value / 60.0
        elif orig_unit in ('seconds', 'second', 'sec', 'secs', 's'):
            return orig_value / (60.0*60.0)
        else:
            raise ValueError('Unknown unit of time: {0}'.format(orig_unit))

    def concentration_to_mM(orig_value, orig_unit):
        if orig_unit in ('millimolar'):
            return orig_value
        else:
            raise ValueError('Unknown unit of concentration: {0}'.format(orig_unit))

    unit_conversions = {
        'Attach Duration': (time_to_hour,        'hours'),
        'Dose Duration':   (time_to_hour,        'hours'),
        'Dose':            (concentration_to_mM, 'mM'),
    }

    unit_colnames = {}
    for colname, dirty_colname in zip(clean_column_names, df.columns):
        if colname.endswith('Unit'):
            unit_colnames[colname[:-len('Unit')]] = dirty_colname

    all_results = {}
    for i, row in df.iterrows():
        result = {}
        protocols = []
        for colname, value in zip(clean_column_names, row):
            if (colname == 'Sample Name'
                or (isinstance(value, float) and np.isnan(value))):
                pass
            elif colname.startswith('Protocol REF'):
                protocols.append(value)
            elif colname.endswith('Unit'):
                pass
            elif colname in unit_conversions:
                conversion_function, dest_units = unit_conversions[colname]
                result['{0} ({1})'.format(colname, dest_units)] = (
                    conversion_function(float(value), row[unit_colnames[colname]])
                )
            else:
                result[colname] = value

        # Special columns
        result['Protocols'] = protocols
        all_results[row['Sample Name']] = result

    return all_results


def read_assay(cfg, f):
    # A transcription_micro file describes the technology used to measure
    # gene expression levels in each sample
    df = pd.read_table(f, encoding=cfg.FILE_ENCODING)
    return df


def clean_up_assay(a):
    clean_column_names = [
        re.sub(r'^Parameter Value\[(.*)\]$', r'\1',
               re.sub(r'^Comment\[(.*)\]$', r'\1', f))
        for f in a.columns.values
        ]

    all_results = {}
    for i, row in a.iterrows():
        sampleName = row['Sample Name']
        result = {}
        for colname, value in zip(clean_column_names, row):
            if (colname == 'Sample Name'
                or (isinstance(value, float) and np.isnan(value))
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
        result[sample]['_assay'] = clean_a[sample]

    return result

def read_processed_data(cfg, f):
    # A processed data file is a flat table of expression strength numbers
    # (in some arbitrary units).  Rows are genes (more precisely, individual
    # probes in the gene chip), columns are samples
    df = pd.read_table(f, index_col=0, encoding=cfg.FILE_ENCODING)
    return df


def read_annotations(cfg, f):
    # An annotations file is a gene-chip-vendor-provided spec of what each
    # probe (row in processed data) is actually talking about
    #
    # Starts with a bunch of comment lines with descriptions of each column
    # (ignore for now)
    df = pd.read_table(f, comment='#', encoding=cfg.FILE_ENCODING)
    return df