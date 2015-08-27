/**
 * @class Taco.model.OrderItemDiscount
 */
Ext.define('Taco.model.OrderItemDiscount', {
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
            "name": "quantity",
            "type": "int",
            "useNull": true
        },
        {
            "name": "description",
            "type": "string",
            "useNull": true
        },
        {
            "name": "unitPrice",
            "type": "float",
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
        },
        {
            "name": "appliesToSalePrice",
            "type": "boolean",
            useNull: true,
            defaultValue: null
        }
    ],

    associations: [
        {
            type: 'belongsTo',
            model: 'Taco.model.Order'
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