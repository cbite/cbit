type FieldCategory = (
  "Technical" |
  "Biological" |
  "Material > General" |
  "Material > Chemical" |
  "Material > Physical" |
  "Material > Mechanical"
)

type FieldDataType = (
  "string" |
  "double"
)

export interface FieldMeta {
  exists?: boolean,
  description?: string,
  category?: FieldCategory,
  data_type?: FieldDataType
};
