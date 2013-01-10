/**
* @class Taco.model.Cart
* @author James Zetlen
* The Cart model. For admin cart management and phone order creation.
*/

Ext.define('Taco.model.Cart', {
    extend: 'Taco.core.data.Model',
    requires: ['Taco.model.Product'],
    "fields":
    [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        }
    ],
    associations: [
        {
            type: 'hasMany',
            model: 'Taco.model.CartItem',
            foreignKey: 'items'
        }
    ],
    
    proxy: {
        type: 'readahead',
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