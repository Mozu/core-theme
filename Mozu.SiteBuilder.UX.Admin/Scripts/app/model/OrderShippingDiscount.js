/**
 * @class Taco.model.OrderShippingDiscount
 */
Ext.define('Taco.model.OrderShippingDiscount', {
    extend: 'Taco.core.data.Model',
    requires: ['Ext.data.association.BelongsTo'],
    fields: [
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

/*
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/order/orderitem/list',
            create: '/admin/app/order/orderitem/create',
            update: '/admin/app/order/orderitem/edit',
            destroy: '/admin/app/order/orderitem/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
*/
});