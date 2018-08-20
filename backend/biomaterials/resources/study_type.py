import config.config as cfg

class StudyType:
    biomaterials = "Biomaterials"
    biomaterials_rna_seq = "Biomaterials RNASeq"
    tendons = "Tendons"
    tendons_rna_seq = "Tendons RNASeq"


def determineIndex(studyType):
    switcher = {
        StudyType.biomaterials: cfg.ES_INDEX_BIOMATERIALS,
        StudyType.tendons: cfg.ES_INDEX_TENDONS
    }
    return switcher.get(studyType, "Invalid study type")
