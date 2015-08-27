/**
* @class Taco.model.ProductImageDocument
* @author Jason Cochran
* The Product Image Document model
*/

Ext.define('Taco.model.ProductImageDocument', {
    extend: 'Taco.core.data.Model',
    "fields":
  [
    {
        "name": "productCode",
        "type": "string",
        "useNull": true
    },
    {
        "name": "id",
        "type": "string",
        "useNull": true
    },
    {
        "name": "fileName",
        "type": "string",
        "useNull": true
    },
    {
        "name": "altText",
        "type": "auto",
        "useNull": true
    },
    {
        "name": "caption",
        "type": "string",
        "useNull": true
    }
  ],

    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/image/document/list',
            create: '/admin/app/image/document/create',
            update: '/admin/app/image/document/edit',
            destroy: '/admin/app/image/document/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
});