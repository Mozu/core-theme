/**
 * @class Taco.model.NetTerms
 */
Ext.define('Taco.model.NetTerms', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'value', type: 'string' },
        { name: 'sequenceNumber', type: 'int', useNull: true }
    ]
});
