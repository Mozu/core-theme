/**
* @class Taco.model.ProductVariation
* @author Jason Cochran
* The ProductVariation model
*/




Ext.define('Taco.model.ProductVariation', {
    extend: 'Taco.core.data.Model',
    
    fields:
    [
        {
            "name": "deltaPrice",
            "type": "float",
            "useNull": true
        },
        {
            name: "deltaMsrp",
            type: "float",
            useNull: true
        },
        {
            name: "deltaCost",
            type: "float",
            useNull: true
        },
        {
            "name": "deltaWeight",
            "type": "float",
            "useNull": true
        },
        {
            name: "creditValue",
            type: "float",
            useNull: true
        },
        {
            "name": "isActive",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "isOrphan",
            "type": "boolean",
            "useNull": true
        },
        //{
        //    "name": "manageInventory",
        //    "type": "boolean",
        //    "useNull": true
        //},
        {
            "name": "stockOnHand",
            "type": "int",
            "useNull": true
        },
        {
            "name": "stockOnOrder",
            "type": "int",
            "useNull": true
        },
        {
            name: "fulfillmentTypesSupported",
            type: "auto",
            defaultValue: []
        },
        {
            name: "upc",
            type: "string",
            useNull: true,
            convert:function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: "mfgPartNumber",
            type: "string",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: "distPartNumber",
            type: "string",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: "costCurrencyCode",
            type: "string",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: "cost",
            type: "float",
            useNull: true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            "name": "exists",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "key",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productCode",
            "type": "string",
            "useNull": true,
            convert: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            },
            serialize: function (v) {
                return Taco.core.data.Model.nullIfEmpty(v);
            }
        },
        {
            name: 'options',
            type: 'any',
            defaultValue: []
        }
    ],
    belongsTo: 'Taco.model.Product',

    idProperty: 'key',

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/productVariation/list',
            update: '/admin/app/productVariation/edit'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});