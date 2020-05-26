/**
* @class Taco.model.GenericAttribute
* @author Amol Shinde
*/

Ext.define('Taco.model.GenericAttribute', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Taco.core.data.Model'
    ],
    "fields":
    [
            { name: 'id', type: 'auto' },
            { name: 'attributeId', type: 'auto' },
            { name: 'localeCode', type: 'string', useNull: true },
            { name: 'value', type: 'any' },
            { name: 'optionalValue', type: 'string' },
            { name: 'isOverriden', type: 'bool' },
            { name: 'valueSequence', type: 'int', useNull: true }
    ]
});