class StudyType:
    biomaterial_microarray = "Biomaterial DNA microarray"
    biomaterial_rna_seq = "Biomaterial RNA sequencing "
    tendons_microarray = "Tendons DNA microarray"
    tendons_rna_seq = "Tendons RNA sequencing"


class GeneExpressionType:
    microarray = "Microarray"
    rna_seq = "RNA sequencing"


def determineBiomaterialsStudyType(geneExpressionType):
    switcher = {
        GeneExpressionType.microarray: StudyType.biomaterial_microarray,
        GeneExpressionType.rna_seq: StudyType.biomaterial_rna_seq,
    }
    return switcher.get(geneExpressionType, "Invalid gene expression type")

def determineTendonsStudyType(geneExpressionType):
    switcher = {
        GeneExpressionType.microarray: StudyType.tendons_microarray,
        GeneExpressionType.rna_seq: StudyType.tendons_rna_seq,
    }
    return switcher.get(geneExpressionType, "Invalid gene expression type")
