export type FieldCategory = (
  "Technical" |
  "Biological" |
  "Material > General" |
  "Material > Chemical" |
  "Material > Physical" |
  "Material > Mechanical"
)

export type FieldVisibility = (
  "hidden" |
  "main" |
  "additional" |
  "unit"
);

export type FieldDataType = (
  "string" |
  "double"
)

export interface FieldMeta {
  exists?: boolean,
  description?: string,
  category?: FieldCategory,
  visibility?: FieldVisibility,
  data_type?: FieldDataType
};
