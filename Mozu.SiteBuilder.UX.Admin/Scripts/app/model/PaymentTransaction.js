/**
 * @class Taco.model.PaymentTransaction
 */
Ext.define('Taco.model.PaymentTransaction', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "id",
        "type": "string",
        "useNull": true
    }, {
        "name": "paymentServiceTransactionId",
        "type": "string",
        "useNull": true
    }, {
        "name": "orderId",
        "type": "string",
        "useNull": true
    }, {
        "name": "transactionType",
        "type": "string",
        "useNull": true
    }, {
        "name": "paymentReference",
        "type": "auto",
        "useNull": true
    }, {
        "name": "billingAddress",
        "type": "auto",
        "useNull": true
    }, {
        "name": "status",
        "type": "string",
        "useNull": true
    }, {
        "name": "interactions",
        "type": "auto",
        "useNull": true
    }, {
        "name": "isRecurring",
        "type": "boolean",
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

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/order/paymenttransaction/list',
            create: '/admin/app/order/paymenttransaction/create',
            update: '/admin/app/order/paymenttransaction/edit',
            destroy: '/admin/app/order/paymenttransaction/delete'
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