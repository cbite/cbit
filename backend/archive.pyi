import pandas as pd

class Archive(object):
    def __init__(self,
                 investigation: dict,
                 study_samples: pd.DataFrame,
                 assay: pd.DataFrame,
                 processed_data_set: pd.DataFrame,
                 annotations: pd.DataFrame
                 ): ...