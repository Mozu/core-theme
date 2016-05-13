/**
 * @class Taco.model.PurchaseOrderCustomField
 */
Ext.define('Taco.model.PurchaseOrderCustomField', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'code', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'isEnabled', type: 'boolean' },
        { name: 'isRequired', type: 'boolean' },
        { name: 'sequenceNumber', type: 'boolean' }
    ]
});
