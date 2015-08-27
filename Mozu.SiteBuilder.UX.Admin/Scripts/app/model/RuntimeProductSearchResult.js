/**
* @class Taco.model.RuntimeProductSearchResult
* A small version of RuntimeProduct returned in a collection of search results.
*/

Ext.define('Taco.model.RuntimeProductSearchResult', {
    extend: 'Taco.core.data.Model',
/*    requires: ['Taco.model.ProductOption', 'Taco.model.ProductVariation'],*/
    "fields":
  [
    {
        "name": "name",
        "type": "string",
        "useNull": false
    },
    {
        "name": "hasStandAloneOptions",
        "type": "boolean",
        "useNull": true
    },
    {
        "name": "hasConfigurableOptions",
        "type": "boolean",
        "useNull": true
    },
    {
        "name": "isActive",
        "type": "boolean",
        defaultValue:true,
        "useNull": true
    },
    {
        "name": "productImages",
        "type": "auto",
        "useNull": true
    },
    {
        "name": "productCode",
        "type": "string",
        "useNull": true
    },
    {
        "name": "productName",
        "type": "string",
        "useNull": true
    },
    {
        "name": "productShortDescription",
        "type": "string",
        "useNull": true
    },
    {
        "name": "listPrice",
        "type": "float",
        "useNull": true
    },
    {
        "name": "price",
        "type": "float",
        "useNull": true
    },
    {
        "name": "salePrice",
        "type": "float",
        "useNull": true
    }
  ],
    idProperty: 'productCode',
    hasMany: [{

        model: 'Taco.model.ProductOption',
        name: 'productOptions',
        foreignKey: 'productCode',
        //,
        primaryKey: 'productCode'
    },
    {

        model: 'Taco.model.ProductVariation',
        name: 'productVariations',
        foreignKey: 'productCode',
        //,
        primaryKey: 'productCode'
    }
    ],


    set: function (fieldName, newValue) {
        var valArr ,
            idx,
            parts = Ext.isString(fieldName) ?  fieldName.split ('.') : [];
        if ( parts.length ==2){
            valArr = Ext.Array.clone(this.get(parts[0]) ||[]);
            idx = parseInt(parts[1],10) || 0;
            valArr.splice ( idx,1,newValue);
            this.callParent( [parts[0], valArr]);
        }else{
            this.callParent(arguments);
        }
    },
    validations: [

        { type: 'length', name: 'productName', min: 3, max: 100 },
        { type: 'presence', name: 'productName' },
         { type: 'presence', name: 'productCode' },
         { type: 'length', name: 'productCode', min: 3, max: 30 },
         { type: 'format', name: 'productCode', matcher: /^[A-z0-9\-]*$/ }
    ],

    
    proxy: {
        type: 'ajax',
        api: {
            //read: '/Scripts/Taco/mocks/categories.json',
            read: '/admin/app/Product/list',
            create: '/admin/app/Product/create',
            update: '/admin/app/Product/edit',
            destroy: '/admin/app/Product/delete',
            duplicate: '/admin/app/Product/duplicate'
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