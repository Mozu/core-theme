/**
 * @class Taco.model.Shipment
 */
Ext.define('Taco.model.Shipment', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "id",
        "type": "int",
        "useNull": true
    }, {
        "name": "shippingAddress",
        "type": "auto",
        "useNull": true
    }, {
        "name": "shippingMethodCode",
        "type": "string",
        "useNull": true
    }, {
        "name": "carrier",
        "type": "string",
        "useNull": true
    }, {
        "name": "status",
        "type": "string",
        "useNull": true
    }, {
        "name": "trackingCodeOrNumber",
        "type": "string",
        "useNull": true
    }, {
        "name": "trackingLink",
        "type": "string",
        "useNull": true
    }, {
        "name": "price",
        "type": "auto",
        "useNull": true
    }, {
        "name": "estimatedDeliveryDate",
        "type": "date",
        "useNull": true
    }, {
        "name": "createDate",
        "type": "date",
        "useNull": true,
        dateFormat: 'c'
    }, {
        "name": "createBy",
        "type": "string",
        "useNull": true
    }, {
        "name": "updateDate",
        "type": "date",
        "useNull": true,
        dateFormat: 'c'
    }, {
        "name": "updateBy",
        "type": "string",
        "useNull": true
    }],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/order/shipment/list',
            create: '/admin/app/order/shipment/create',
            update: '/admin/app/order/shipment/edit',
            destroy: '/admin/app/order/shipment/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: true,
            type: 'json'
        }
    }
});