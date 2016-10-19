#!/usr/bin/python2.7

import sys
import zipfile
import psycopg2
from collections import defaultdict
import itertools


# Config
DB_HOST = "localhost"
DB_PORT = 5432
DB_USER = "cbit"
DB_PASS = "2076a675b6d813b582977189c13a3279cc9cf02a9aeab01389798d9167cf259c8b247aee9a2be149"
DB_NAME = "cbit"


def connect_to_postgres():
    return psycopg2.connect(host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS, database=DB_NAME)


def read_investigation(f):
    # An investigation file looks like this:
    #
    # SECTION HEADER
    # FieldName <TAB> FieldValue { <TAB> FieldValue }* [<TAB>]
    #
    # Field Values may be quoted, and unfortunately, quoted fields may
    # contain raw newlines in them.  So we need to work to parse these files
    #
    # TODO: No idea how double quotes are themselves quoted in this format

    s = f.read()

    # Token generator
    # Yields either '\t', '\n', or a string (with quotes removed)
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

            elif c in ('\t', '\n', None):
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
            if token in ('\n', None):
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


def import_archive(study_name, archive_filename):
    with zipfile.ZipFile(archive_filename, mode='r') as z:
        filenames = z.namelist()



if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.stderr.write("Usage: ./importer.py <study name> <study archive (zip file)>")
        raise SystemExit

    _, study_name, archive_filename = sys.argv
    import_archive(study_name, archive_filename)