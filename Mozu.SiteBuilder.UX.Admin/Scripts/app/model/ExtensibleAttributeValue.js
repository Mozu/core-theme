/**
 * @class Taco.model.ExtensibleAttributeValue
 */
Ext.define('Taco.model.ExtensibleAttributeValue', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'fullyQualifiedName', type: 'string' },
        { name: 'attributeDefinitionId', type: 'int' },
        { name: 'values', type: 'auto' }
    ],
    idProperty: 'fullyQualifiedName'
});
