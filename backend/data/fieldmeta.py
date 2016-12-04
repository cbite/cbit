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

        # Defensively decode UTF-8 encoded strings
        self.fieldName = fieldName.decode('utf-8') if isinstance(fieldName, str) else fieldName
        self.description = description.decode('utf-8') if isinstance(description, str) else description
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

    def copy_with_new_name(self, newFieldName):
        return FieldMeta(newFieldName, self.description,
                         self.category, self.visibility, self.dataType,
                         self.dimensions, self.preferredUnit)

    # For derived fields, we synthesize field metadata from the underlying fields
    # See reader.apply_special_treatments_to_study_sample for details
    @staticmethod
    def map_derived_field_name_to_underlying_field(fieldName):
        if not fieldName.startswith('*'):
            return fieldName
        elif fieldName.startswith('*Phase composition - '):
            return u'Phase composition'
        elif fieldName.startswith('*Elements composition - '):
            return u'Elements composition'
        elif fieldName.startswith('*Wettability - '):
            return u'Wettability'
        else:
            # Don't mask the merged fields like '*Material', '*Cell strain' or '*Compound'
            # These really should have different metadata (e.g., the underlying fields could
            # be hidden but the merged field is visible)
            return fieldName

    @staticmethod
    def from_db_multi(cur, fieldNames):

        realFieldNames = {
            fieldName: FieldMeta.map_derived_field_name_to_underlying_field(fieldName)
            for fieldName in fieldNames
        }

        cur.execute(
            """
            SELECT field_name, description, category, visibility, data_type, dimensions, preferred_unit
            FROM dim_meta_meta
            WHERE field_name IN %s
            """, (tuple(set(realFieldNames.values())),))
        dbResults = cur.fetchall()

        rawRawResults = [
            FieldMeta(fieldName, description, category, visibility,
                      dataType, dimensions, preferredUnit)
            for (fieldName, description, category, visibility, dataType,
                 dimensions, preferredUnit) in dbResults
        ]

        rawResults = {
            f.fieldName: f     # Gotta be careful here with UTF-8 decoding of raw fieldName from DB
            for f in rawRawResults
        }

        expandedResults = {
            fieldName: rawResults[realFieldNames[fieldName]]
            for fieldName in fieldNames
            if realFieldNames[fieldName] in rawResults
        }

        # Have to mask the identity of synthesized fields
        results = {
            fieldName: rawFieldMeta if fieldName == rawFieldMeta.fieldName else rawFieldMeta.copy_with_new_name(fieldName)
            for fieldName, rawFieldMeta in expandedResults.iteritems()
        }

        return results.values()

    @staticmethod
    def to_db_multi(cur, fieldMetas, insertOrUpdate='insert'):

        # Disallow setting metadata of synthetic fields directly
        for f in fieldMetas:  # type: FieldMeta
            if f.fieldName != FieldMeta.map_derived_field_name_to_underlying_field(f.fieldName):
                raise ValueError('Cannot set field metadata of synthetic field {0}'.format(f.fieldName))

        if insertOrUpdate == 'insert':
            cur.executemany(
                """
                INSERT INTO dim_meta_meta
                (field_name, description, category, visibility, data_type, dimensions, preferred_unit)
                VALUES
                (%s, %s, %s, %s, %s, %s, %s)
                """,
                [
                    (f.fieldName, f.description, f.category, f.visibility, f.dataType, f.dimensions, f.preferredUnit)
                    for f in fieldMetas
                ]
            )
        elif insertOrUpdate == 'update':

            # NOTE: Neither dataType nor dimensions can be changed for an existing
            # field, so we don't even pass the update through to the DB level
            cur.executemany(
                """
                UPDATE dim_meta_meta
                SET
                    description = %s,
                    category = %s,
                    visibility = %s,
                    preferred_unit = %s
                WHERE field_name = %s
                """,
                [
                    (f.description, f.category, f.visibility, f.preferredUnit,

                    f.fieldName)
                    for f in fieldMetas
                ]
            )
