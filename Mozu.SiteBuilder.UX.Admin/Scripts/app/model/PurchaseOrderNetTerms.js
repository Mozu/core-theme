/**
 * @class Taco.model.PurchaseOrderNetTerms
 */
Ext.define('Taco.model.PurchaseOrderNetTerms', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'term', type: 'string' },
        { name: 'sequenceNumber', type: 'int', useNull: true }
    ]
});
