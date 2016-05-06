/**
 * @class Taco.model.NetTerms
 */
Ext.define('Taco.model.NetTerms', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'value', type: 'any' },
        { name: 'sequenceNumber', type: 'int', useNull: true }
    ]
});
