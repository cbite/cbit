from data.unit_conversions import DimensionsRegister

class FieldMeta(object):
    validCategories = frozenset((
        "Technical",
        "Biological",
        "Material > General",
        "Material > Chemical",
        "Material > Physical",
        "Material > Mechanical",
    ))

    validVisibilities = frozenset((
        'hidden',
        'main',
        'additional',
        'unit',
    ))

    validDataTypes = frozenset((
        'string',
        'double',
    ))

    validDimensions = frozenset(DimensionsRegister.keys())

    def __init__(self, fieldName, description, category, visibility, dataType, dimensions, preferredUnit):
        """
        Python wrapper object for the corresponding FieldMeta object:

        export type FieldCategory = ( /* see validCategories above */ );
        export type FieldVisibility = ( /* see validVisibilities above */ );
        export type FieldDataType = ( /* see validDataTypes above */ );
        export type DimensionsType = ( /* see validDimensions above */ );

        export interface FieldMeta {
          exists?: boolean,
          fieldName?: string,
          description?: string,
          category?: FieldCategory,
          visibility?: FieldVisibility,
          dataType?: FieldDataType,
          dimensions?: DimensionsType,
          preferredUnit?: string     // Anything returned by DimensionsRegister[x].getPossibleUnits()
        };
        """

        if not fieldName:
            raise ValueError("Field name can't be empty")

        if category not in FieldMeta.validCategories:
            raise ValueError("Invalid category in field metadata: {0}, try one of these: {1}"
                             .format(category, FieldMeta.validCategories))

        if visibility not in FieldMeta.validVisibilities:
            raise ValueError("Invalid visibility in field metadata: {0}, try one of these: {1}"
                             .format(visibility, FieldMeta.validVisibilities))

        if dataType not in FieldMeta.validDataTypes:
            raise ValueError("Invalid data type in field metadata: {0}, try one of these {1}"
                             .format(dataType, FieldMeta.validDataTypes))

        if dimensions not in FieldMeta.validDimensions:
            raise ValueError("Invalid dimensions in field metadata: {0}, try one of these {1}"
                             .format(dimensions, FieldMeta.validDimensions))

        if preferredUnit not in DimensionsRegister[dimensions].getPossibleUnits():
            raise ValueError("Invalid preferred unit in field metadata: {0}.  For a value with dimensions `{1}`, try one of these {2}"
                             .format(preferredUnit, dimensions, FieldMeta.validDimensions))

        # Defensively decode UTF-8 encoded strings (harmless on already decoded unicode string)
        self.fieldName = fieldName.decode('utf-8')
        self.description = description.decode('utf-8')
        self.category = category
        self.visibility = visibility
        self.dataType = dataType
        self.dimensions = dimensions
        self.preferredUnit = preferredUnit


    @staticmethod
    def from_json(jsObj):

        if 'fieldName' not in jsObj:
            raise ValueError("Missing 'fieldName'")
        if 'description' not in jsObj:
            raise ValueError("Missing 'description'")
        if 'category' not in jsObj:
            raise ValueError("Missing 'category'")
        if 'visibility' not in jsObj:
            raise ValueError("Missing 'visibility'")
        if 'dataType' not in jsObj:
            raise ValueError("Missing 'dataType'")
        if 'dimensions' not in jsObj:
            raise ValueError("Missing 'dimensions'")
        if 'preferredUnit' not in jsObj:
            raise ValueError("Missing 'preferredUnit'")

        return FieldMeta(
            fieldName=jsObj["fieldName"],
            description=jsObj["description"],
            category=jsObj["category"],
            visibility=jsObj["visibility"],
            dataType=jsObj["dataType"],
            dimensions=jsObj["dimensions"],
            preferredUnit=jsObj["preferredUnit"]
        )


    def to_json(self):
        return {
            "fieldName": self.fieldName,
            "description": self.description,
            "category": self.category,
            "visibility": self.visibility,
            "dataType": self.dataType,
            "dimensions": self.dimensions,
            "preferredUnit": self.preferredUnit,
        }

    @staticmethod
    def from_db_multi(cur, where_clause="", where_params=()):
        cur.execute(
            """
            SELECT field_name, description, category, visibility, data_type, dimensions, preferred_unit
            FROM dim_meta_meta
            {0}
            """.format(where_clause),
            where_params)
        dbResults = cur.fetchall()

        print(dbResults)

        return [FieldMeta(fieldName, description, category, visibility, dataType, dimensions, preferredUnit)
                for (fieldName, description, category, visibility, dataType, dimensions, preferredUnit) in dbResults]

    @staticmethod
    def to_db_multi(cur, fieldMetas, insertOrUpdate='insert'):
        if insertOrUpdate == 'insert':
            cur.executemany(
                """
                INSERT INTO dim_meta_meta
                (field_name, description, category, visibility, data_type, dimensions, preferredUnit)
                VALUES
                (%s, %s, %s, %s, %s, %s, %s)
                """,
                [
                    (f.fieldName, f.description, f.category, f.visibility, f.dataType, f.dimensions, f.preferredUnit)
                    for f in fieldMetas
                ]
            )
        elif insertOrUpdate == 'update':
            cur.executemany(
                """
                UPDATE dim_meta_meta
                SET
                    description = %s,
                    category = %s,
                    visibility = %s,
                    data_type = %s,
                    dimensions = %s,
                    preferred_unit = %s
                WHERE field_name = %s
                """,
                [
                    (f.description, f.category, f.visibility, f.dataType, f.dimensions, f.preferredUnit,

                    f.fieldName)
                    for f in fieldMetas
                ]
            )
