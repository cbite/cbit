import pandas as pd

def read_investigation(f: file) -> dict: ...
def flatten_investigation(i: dict) -> dict: ...
def remove_empty_values_in_dict(d: dict) -> dict: ...
def remove_common_prefixes(d: dict) -> dict: ...
def read_study_sample(f: file) -> pd.DataFrame: ...
def read_assay(f: file) -> pd.DataFrame: ...
def read_processed_data(f: file) -> pd.DataFrame: ...
def read_annotations(f: file) -> pd.DataFrame: ...
