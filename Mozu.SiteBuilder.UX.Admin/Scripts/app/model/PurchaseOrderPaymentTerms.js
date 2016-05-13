/**
 * @class Taco.model.PurchaseOrderPaymentTerms
 */
Ext.define('Taco.model.PurchaseOrderPaymentTerms', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'description', type: 'string' },
        { name: 'sequenceNumber', type: 'int', useNull: true }
    ]
});
