/**
 * @class Taco.model.OrderItem
 */
Ext.define('Taco.model.OrderItem', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "id",
        "type": "string",
        "useNull": true
    }, {
        "name": "originalCartItemId",
        "type": "string",
        "useNull": true
    }, {
        "name": "localeCode",
        "type": "string",
        "useNull": true
    }, {
        "name": "product",
        "type": "auto",
        "useNull": true
    }, {
        "name": "quantity",
        "type": "auto",
        "useNull": true
    }, {
        "name": "subTotal",
        "type": "float",
        "useNull": true
    }, {
        "name": "discountTotal",
        "type": "float",
        "useNull": true
    }, {
        "name": "total",
        "type": "float",
        "useNull": true
    }, {
        "name": "productReservationId",
        "type": "int",
        "useNull": true
    }, {
        "name": "createDate",
        "type": "date",
        "useNull": true
    }, {
        "name": "createBy",
        "type": "string",
        "useNull": true
    }, {
        "name": "updateDate",
        "type": "date",
        "useNull": true
    }, {
        "name": "updateBy",
        "type": "string",
        "useNull": true
    }],

    associations: [
        {
            type: 'hasOne',
            model: 'Taco.model.Product',
            foreignKey: 'product'
        }
    ],

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
});