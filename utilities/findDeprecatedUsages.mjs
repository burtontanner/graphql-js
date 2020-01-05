import { GraphQLError } from '../error/GraphQLError';
import { visit } from '../language/visitor';
import { getNamedType } from '../type/definition';
import { TypeInfo, visitWithTypeInfo } from './TypeInfo';
/**
 * A validation rule which reports deprecated usages.
 *
 * Returns a list of GraphQLError instances describing each deprecated use.
 */

export function findDeprecatedUsages(schema, ast) {
  var errors = [];
  var typeInfo = new TypeInfo(schema);
  visit(ast, visitWithTypeInfo(typeInfo, {
    Field: function Field(node) {
      var parentType = typeInfo.getParentType();
      var fieldDef = typeInfo.getFieldDef();

      if (parentType && fieldDef && fieldDef.deprecationReason != null) {
        errors.push(new GraphQLError("The field \"".concat(parentType.name, ".").concat(fieldDef.name, "\" is deprecated. ") + fieldDef.deprecationReason, node));
      }
    },
    EnumValue: function EnumValue(node) {
      var type = getNamedType(typeInfo.getInputType());
      var enumVal = typeInfo.getEnumValue();

      if (type && enumVal && enumVal.deprecationReason != null) {
        errors.push(new GraphQLError("The enum value \"".concat(type.name, ".").concat(enumVal.name, "\" is deprecated. ") + enumVal.deprecationReason, node));
      }
    }
  }));
  return errors;
}
