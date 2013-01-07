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
            "name": "isActive",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "isOrphan",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "manageInventory",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "stockOnHand",
            "type": "int",
            "useNull": true
        },
        {
            "name": "exists",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "weight",
            "type": "float",
            "useNull": true
        },
        {
            "name": "optionValue1",
            "type": "string",
            "useNull": true
        },
        {
            "name": "optionValue2",
            "type": "string",
            "useNull": true
        },
        {
            "name": "optionValue3",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productVariationCode",
            "type": "string",
            "useNull": true
        }
      ]
    ,
    belongsTo: 'Taco.model.Product',

    idProperty: 'id',

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