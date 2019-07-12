/**
 * @class Taco.model.Shipment
 */
Ext.define('Taco.model.Shipment', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "id",
            "type": "int",
            "useNull": true
        },
        {
            "name": "currencyCode",
            'type': 'string',
            "useNull": true
        },
        {
            "name": "cost",
            'type': 'float',
            "useNull": true
        },
        {
            "name": "shippingMethodCode",
            'type': 'string',
            "useNull": true
        },
        {
            "name": "trackingNumber",
            'type': 'string',
            "useNull": true
        },
        {
            "name": "signatureRequired",
            'type': 'boolean',
            "useNull": true
        },
        {
            "name": "originAddress",
            'type': 'auto',
            "useNull": true
        },
        {
            "name": "destinationAddress",
            'type': 'auto',
            "useNull": true
        },
        {
            "name": "packageIds",
            'type': 'auto',
            "useNull": true
        },
        {
            "name": "number",
            'type': 'int',
            "useNull": true
        },
        {
            "name": "originalOrderId",
            'type': 'string',
            "useNull": true
        },
        {
            "name": "orderNumber",
            "type": "string",
            "useNull": true
        }, {
            "name": "customerAccountId",
            "type": "int",
            "useNull": true
        }, {
            "name": "customerTaxId",
            "type": "string",
            "useNull": true
        }, {
            "name": "shippingMethodName",
            "type": "string",
            "useNull": true
        }, {
            "name": "shipmentStatus",
            "type": "string",
            "useNull": true
        }, {
            "name": "packages",
            "type": "auto",
            "useNull": true
        },
        {
            'name': 'items',
            'type': 'hasMany',
            'model': 'Taco.model.ShipmentItem',            
            'reader': 'json'
        },
        {
            'name': 'canceledItems',
            'type': 'hasMany',
            'model': 'Taco.model.ShipmentItem',            
            'reader': 'json'
        },
        {
            "name": "auditInfo",
            "type": "auto",
            "useNull": true
        },
        {
            name: 'lastUpdated',
            //type: 'date',
            type:'string',
            //dateFormat: 'c',
            //d M, Y, g:i a
            convert: function (value, model) {
                return model.get('auditInfo').updateDate;
            },
            defaultValue: null
        },
        {
            "name": "lineItemSubtotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shipmentAdjustment",
            "type": "float",
            "useNull": true
        },
        {
            "name": "lineItemTaxAdjustment",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shippingAdjustment",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shippingTaxAdjustment",
            "type": "float",
            "useNull": true
        },
        {
            "name": "handlingAdjustment",
            "type": "float",
            "useNull": true
        },
        {
            "name": "handlingTaxAdjustment",
            "type": "float",
            "useNull": true
        },
        {
            "name": "dutyAdjustment",
            "type": "float",
            "useNull": true
        },
        //new fields
        {
            "name": "lineItemTaxTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "handlingTaxTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "handlingSubTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shippingTaxTotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "shippingSubTotal",
            "type": "float",
            "useNull": true
        }
    ],

    //proxy: {
    //    type: 'ajaxproxy',
    //    api: {
    //        read: '/admin/app/order/shipment/list',
    //        create: '/admin/app/order/shipment/create',
    //        update: '/admin/app/order/shipment/edit',
    //        destroy: '/admin/app/order/shipment/delete'
    //    },
    //    reader: {
    //        type: 'json',
    //        root: 'items',
    //        successProperty: 'success',
    //        messageProperty: "message"
    //    },
    //    writer: {
    //        allowSingle: true,
    //        type: 'json'
    //    }
    //}
});