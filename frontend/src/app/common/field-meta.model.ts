export type FieldCategory = (
  "Technical" |
  "Biological" |
  "Material > General" |
  "Material > Chemical" |
  "Material > Physical" |
  "Material > Mechanical"
);

export type FieldVisibility = (
  "hidden" |
  "main" |
  "additional" |
  "unit"
);

export type FieldDataType = (
  "string" |
  "double"
);

export type DimensionsType = (
  'none' |
  'time' |
  'concentration' |
  'mass' |
  'area' |
  'weight_loss' |
  'length' |
  'pressure' |
  'angle' |
  'percentage' |
  'parts_per' |
  'temperature' |
  'electric_potential_difference'
);

export interface FieldMeta {
  exists?: boolean,
  fieldName?: string,
  description?: string,
  category?: FieldCategory,
  visibility?: FieldVisibility,
  dataType?: FieldDataType,
  dimensions?: DimensionsType,
  preferredUnit?: string
};
