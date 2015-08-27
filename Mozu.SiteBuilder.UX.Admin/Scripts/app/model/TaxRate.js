/**
 * @class Taco.model.TaxRate
 */


Ext.define('Taco.model.TaxRate', {
    extend: 'Taco.core.data.Model',
    "fields":
  [
    'id',
    {
        "name": "stateCode",
        "type": "string",
        "useNull": true
    }
  ],
   
    //idProperty:'stateCode',


    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/Tax/list',
            create: '/admin/app/Tax/create',
            update: '/admin/app/Tax/edit',
            destroy: '/admin/app/Tax/delete'
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