/**
* @class Taco.model.ProductOptionValue
* @author Jason Cochran
* The ProductOptionValue model
*/


Ext.define('Taco.model.ProductOptionValue', {
    extend: 'Taco.core.data.Model',
    fields:
      [
        {
             "name": "productCode",
             "type": "string",
             "useNull": true
         },
        {
            "name": "intention",
             "type": "string",
             "useNull": true
         },
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
            "name": "isDefault",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "option_id",
            "type": "int",
            "useNull": true
        },
        {
            "name": "id",
            "type": "int",
            "useNull": true
        },
        {
            "name": "sequence",
            "type": "int",
            "useNull": true
        },
        {
            "name": "value",
            "type": "string",
            "useNull": true
        },
        {
            "name": "internalValue",
            "type": "string",
            "useNull": true
        }
      ]
    ,
        belongsTo: 'Taco.model.productOption',
        idProperty: 'id',

    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/Scripts/Taco/mocks/categories.json',
            read: '/admin/app/productOption/listValue',
            create: '/admin/app/productOption/createValue',
            update: '/admin/app/productOption/editValue',
            destroy: '/admin/app/productOption/deleteValue'
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