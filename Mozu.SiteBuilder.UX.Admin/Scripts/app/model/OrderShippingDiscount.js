/**
 * @class Taco.model.OrderShippingDiscount
 */
Ext.define('Taco.model.OrderShippingDiscount', {
    extend: 'Taco.core.data.Model',
    requires: ['Ext.data.association.BelongsTo'],
    fields: [
        {
            "name": "discountId",
            "type": "string",
            "useNull": true
        },
        {
            "name": "couponCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "description",
            "type": "string",
            "useNull": true
        },
        {
            "name": "total",
            "type": "float",
            "useNull": true
        },
        {
            "name": "isActive",
            "type": "boolean"
        }
    ]
});