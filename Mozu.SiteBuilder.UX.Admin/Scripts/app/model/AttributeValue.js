/**
 * @class Taco.model.AttributeValue
 */
Ext.define('Taco.model.AttributeValue', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'attributeId', type: 'auto' },
        { name: 'value', type: 'any' },
        { name: 'valueSequence', type: 'int', useNull: true}
    ]

    
});
