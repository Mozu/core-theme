/**
 * @class Taco.model.OrderItem
 */

/*
{
                        "id": "i123",
                        "productCode": "HOBO-LL",
                        "productName": "Slouchy leather... lace hobo",
                        "unitPrice": 90.0,
                        "quantity": 2,
                        "discount": {
                            "quantity": 2,
                            "description": "$10 off all leather bags",
                            "unitPrice": 10.0,
                            "total": 20.0
                        },
                        "subtotal": 180.0,
                        "total": 160.0
                    }
*/


Ext.define('Taco.model.OrderItem', {
    extend: 'Taco.core.data.Model',
    requires: ['Ext.data.association.HasOne'],
    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },        
        {
            "name": "productCode",
            "type": "string",
            "useNull": false
        },
        {
            "name": "productName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "unitPrice",
            "type": "auto",
            "defaultValue": []
        },
        {
            "name": "quantity",
            "type": "int",
            "useNull": true
        },
        {
            "name": "discount",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "subtotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "total",
            "type": "float",
            "useNull": true
        },
        
        // not currently in json
        {
            "name": "weight",
            "type": "float",
            "defaultValue": 1,
        },
        
        // not currently in json
        {
            "name": "options", //<== get list of options or extras
            "type": "auto",
            "defaultValue": []
        },
    ],

    associations: [
        {
            type: 'hasOne',
            model: 'Taco.model.OrderItemDiscount',
            name: 'discount'
        },
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