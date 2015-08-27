/**
 * @class Taco.model.ItemFilter
 */


Ext.define('Taco.model.ItemFilter', {
    extend: 'Taco.core.data.Model',
    "fields":
  [
    {
        "name": "id",
        "type": "string",
        "useNull": true
    },
    {
        "name": "name",
        "type": "string",
        "useNull": true
    },
    
    {
        "name": "configuration",
        "type": "auto",
        "useNull": true
    }
  ],

    proxy: {
        type: 'memory',
        data: {
            items:[{
                "id": 1,
                "name": "All",
                "configuration": null
            }]
        },
        //api: {
        //    read: '/admin/Scripts/app/mocks/itemfilters.json',
        //    create: '/admin/app/Tax/create',
        //    update: '/admin/app/Tax/edit',
        //    destroy: '/admin/app/Tax/delete'
        //},
        reader: {
            type: 'json',
            root: 'items'
           
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});