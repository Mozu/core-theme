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
    requires: [
        'Ext.data.association.HasOne',
        'Ext.data.association.BelongsTo'
    ],
    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "lineId",
            "type": "int",
            "useNull": false
        },
        {
            "name": "productCode",
            "type": "string",
            "useNull": false
        },
        {
            "name": "parentProductCode",
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
            "type": "float"
        },
        {
            "name": "listPrice",
            "type": "float"
        },
        {
            "name": "salePrice",
            "type": "float",
            "useNull": true
        },
        {
            "name": "quantity",
            "type": "int",
            "useNull": true
        },
        {
            "name": "discounts",
            "type": "auto",
            "defaultValue": []
        },
        {
            "name": "activeDiscount",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "shippingDiscounts",
            "type": "auto",
            "defaultValue": []
        },
        {
            "name": "activeShippingDiscount",
            "type": "auto",
            "useNull": true
        },
        {
            "name": "subtotal",
            "type": "float",
            "useNull": true
        },
        {
            "name": "displaySubtotal",
            "type": "float"
        },
        {
            "name": "total",
            "type": "float",
            "useNull": true
        },
        

        
        
        {
            "name": "weight",
            "type": "float",
            "useNull": true,
            "defaultValue": 1
        },
        
        
        {
            name: "extras",
            type: "auto",
            defaultValue: []
        },
        
        {
            name: "options",
            type: "auto",
            defaultValue: []
        },
        
        {
            name: "bundledProducts",
            type: "auto",
            defaultValue: []
        },
        
        // added this so the ui can modify its behavior when products are deleted
        {
            "name": "isDeleted", 
            "type": "auto",
            "defaultValue": false
        },
        
        {
            name: "isConfigurable",
            type: 'boolean',
            convert: function (v, record) {
                return (record.get("options").length || record.get("extras").length);
            }
        },
        {
            "name": "fulfillmentMethod",
            "type": "string",
            "defaultValue": "ship"
        },
        {
            "name": "fulfillmentLocationCode",
            "type": "string",
            "defaultValue": ""
        },

        {
            "name": "fulfillmentId",
            "type": "string",
            convert: function (v, record) {          
                return record.get("fulfillmentMethod") + "_" + record.get("fulfillmentLocationCode")
            }
        },

        {
            "name": "fulfillmentStatus",
            "type": "string",
        },

        {
            "name": "supportsInStorePickup",
            "type": "boolean",
            "defaultValue": true
        },

        {
            "name": "handlingAmount",
            "type": "auto" 
        }

    ],

    associations: [
        {
            type: 'hasOne',
            model: 'Taco.model.OrderItemDiscount',
            name: 'activeDiscount'
        },
        {
            type: 'hasOne',
            model: 'Taco.model.OrderShippingDiscount',
            name: 'activeShippingDiscount'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.OrderItemDiscount',
            name: 'discounts'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.OrderShippingDiscount',
            name: 'shippingDiscounts'
        },
        {
            type: 'belongsTo',
            model: 'Taco.model.Order'
        }
    ]

    /*
        all proxy interations take place throught the order model
    */ 
    
    

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