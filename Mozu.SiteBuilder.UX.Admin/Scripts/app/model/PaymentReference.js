/**
 * @class Taco.model.PaymentReference
 */
Ext.define('Taco.model.PaymentReference', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "id",
        "type": "int",
        "useNull": true
    }, {
        "name": "paymentType",
        "type": "string",
        "useNull": true
    }, { 
        "name": "card", // Billing contact info under here
        "type": "auto",
        "useNull": true
    }, {
        "name": "createDate",
        "type": "date",
        "useNull": true,
        dateFormat: 'c'
    }, {
        "name": "createBy",
        "type": "string",
        "useNull": true,
        dateFormat: 'c'
    }, {
        "name": "updateDate",
        "type": "date",
        "useNull": true
    }, {
        "name": "updateBy",
        "type": "string",
        "useNull": true
    }],

    proxy: {
        type: 'ajaxproxy',
        api: {
            update: '/admin/app/order/payment/edit'
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