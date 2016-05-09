/**
 * @class Taco.model.PurchaseOrderCustomField
 */
Ext.define('Taco.model.PurchaseOrderCustomField', {
    extend: 'Taco.core.data.Model',
    fields: [
        { name: 'id', type: 'auto' },
        { name: 'code', type: 'string' },
        { name: 'label', type: 'string' },
        { name: 'isEnabled', type: 'bool' },
        { name: 'isRequired', type: 'bool' }
    ]
});
