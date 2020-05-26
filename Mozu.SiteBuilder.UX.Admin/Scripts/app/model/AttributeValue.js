/**
 * @class Taco.model.AttributeValue
 */
Ext.define('Taco.model.AttributeValue', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'attributeId', type: 'auto' },
        { name: 'localeCode', type: 'string', useNull: true },
        { name: 'value', type: 'any' },
        { name: 'optionalValue', type: 'string' },
        { name: 'isOverriden', type: 'bool' },
        { name: 'valueSequence', type: 'int', useNull: true },
        { name: 'mappedGenericValues', type: 'auto', defaultValue: []},
    ]
});
