/**
* @class Taco.model.CartItem
* @author James Zetlen
* The CartItem model. Used in Taco.model.Cart, for admin cart management and phone order creation.
*/

Ext.define('Taco.model.CartItem', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Product'],
    "fields":
    [
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
            "name": "quantity",
            "type": "int",
            "useNull": true
        }
    ],
    associations: [
        {
            type: 'hasOne',
            model: 'Taco.model.Product',
            foreignKey: 'productCode',
            primaryKey: 'productCode'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.ProductOption',
            foreignKey: 'selectedOptions'
        },
        {
            type: 'belongsTo',
            model: 'Taco.model.Cart',
            foreignKey: 'cart'
        }
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