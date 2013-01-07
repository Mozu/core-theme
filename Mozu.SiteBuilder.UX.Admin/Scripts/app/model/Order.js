/**
 * @class Taco.model.Order
 */
Ext.define('Taco.model.Order', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "id",
        "type": "string",
        "useNull": true
    }, {
        "name": "orderNumber",
        "type": "int",
        "useNull": true
    }, {
        "name": "originalCartId",
        "type": "string",
        "useNull": true
    }, {
        "name": "shopperNotes", // Taco.model.ShopperNotes
        "type": "auto",
        "useNull": true
    }, {
        "name": "userId",
        "type": "string",
        "useNull": true
    }, {
        "name": "customerAccountId",
        "type": "int",
        "useNull": true
    }, {
        "name": "email",
        "type": "string",
        "useNull": true
    }, {
        "name": "ipAddress",
        "type": "string",
        "useNull": true
    }, {
        "name": "isoCurrencyCode",
        "type": "string",
        "useNull": true
    }, {
        "name": "orderStatus",
        "type": "string",
        "useNull": true
    }, {
        "name": "paymentStatus",
        "type": "string",
        "useNull": true
    }, {
        "name": "fulfillmentStatus",
        "type": "string",
        "useNull": true
    }, {
        "name": "submittedDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "MS"
    }, {
        "name": "cancelledDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "MS"
    }, {
        "name": "closedDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "MS"
    }, {
        "name": "notes", // Taco.model.OrderNote
        "type": "auto",
        "useNull": true
    }, {
        "name": "items", // Taco.model.OrderItem
        "type": "auto",
        "useNull": true
    }, {
        "name": "shipment", // Taco.model.Shipment
        "type": "auto",
        "useNull": true
    }, {
        "name": "orderDiscount",
        "type": "auto",
        "useNull": true
    }, {
        "name": "payment", // Taco.model.PaymentReference
        "type": "auto",
        "useNull": true
    }, {
        "name": "billingFirstName",
        "type": "string"
    }, {
        "name": "billingLastName",
        "type": "string"
    }, {
        "name": "paymentTransactions", // Taco.model.PaymentTransaction
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
        "name": "shippingTotal",
        "type": "float",
        "useNull": true
    }, {
        "name": "taxTotal",
        "type": "float",
        "useNull": true
    }, {
        "name": "total",
        "type": "float",
        "useNull": true
    }, {
        "name": "lastValidationDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "MS"
    }, {
        "name": "expirationDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "MS"
    }, {
        "name": "createDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "MS"
    }, {
        "name": "createBy",
        "type": "string",
        "useNull": true
    }, {
        "name": "updateDate",
        "type": "date",
        "useNull": true,
        "dateFormat": "MS"
    }, {
        "name": "updateBy",
        "type": "string",
        "useNull": true
    }, {
        "name": "availableOrderActions",
        "type": "auto"
    }, {
        "name": "availablePaymentActions",
        "type": "auto"
    }, {
        "name": "availableShipmentActions",
        "type": "auto"
    }],

    proxy: {
        type: 'ajaxproxy',
        api: {
            // read: '/admin/Scripts/app/mocks/orders.json',
            read: '/admin/app/order/read',
            create: '/admin/app/order/create',
            update: '/admin/app/order/edit',
            destroy: '/admin/app/order/delete'
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
