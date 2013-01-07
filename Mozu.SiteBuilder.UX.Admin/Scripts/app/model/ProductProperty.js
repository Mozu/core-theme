/**
* @class Taco.model.ProductProperty
* @author Jason Cochran
* The ProductProperty model
*/


Ext.define('Taco.model.ProductProperty', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.ProductOptionValue'],
    fields:
      [
        {
            "name": "productCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "id",
            "type": "int",
            "useNull": true
        },
        {
            "name": "internalName",
            "type": "string",
            "useNull": true
        },
        {
            "name": "isMultiValue",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "isRequired",
            "type": "boolean",
            "useNull": true
        },
        {
            "name": "inputType",
            "type": "string",
            "useNull": true
        },
        {
            "name": "maxLength",
            "type": "int",
            "useNull": true
        },
        {
            "name": "minLength",
            "type": "int",
            "useNull": true
        },
        {
            "name": "description",
            "type": "string",
            "useNull": true
        },
        {
            "name": "name",
            "type": "string",
            "useNull": true
        },
        {
            "name": "sequence",
            "type": "int",
            "defaultValue": 0,
            "useNull": true
        }
      ]
    ,
    belongsTo: 'Taco.model.Option',

    idProperty: 'id',
    hasMany: [{

        model: 'Taco.model.ProductOptionValue',
        name: 'productOptionValues',
        primaryKey: 'id',
        foreignKey: 'option_id'
    }],

    //    hasMany: {
    //        model: 'CategoryTreeNode',
    //        name: 'items'
    //    },


    proxy: {
        type: 'ajax',
        api: {
            //read: '/Scripts/Taco/mocks/categories.json',
            read: '/admin/app/productProperties/list',
            create: '/admin/app/productProperties/create',
            update: '/admin/app/productProperties/edit',
            destroy: '/admin/app/productProperties/delete'
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