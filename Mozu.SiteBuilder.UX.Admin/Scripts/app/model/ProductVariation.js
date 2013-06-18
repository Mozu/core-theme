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
            "name": "deltaWeight",
            "type": "float",
            "useNull": true
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
            "useNull": true
        }, {
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