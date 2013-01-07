/**
 * @class Taco.model.TaxRate
 */


Ext.define('Taco.model.TaxRate', {
    extend: 'Taco.core.data.Model',
    "fields":
  [
    {
        "name": "id",
        "type": "string",
        "useNull": true
    },
    {
        "name": "appliesToShipping",
        "type": "boolean",
        "useNull": true
    },
    
    {
        "name": "rate",
        "type": "float",
        "useNull": true
    },
    {
        "name": "stateCode",
        "type": "string",
        "useNull": true
    }
  ],
   
    validations: [

        { type: 'length', name: 'stateCode', min: 2, max: 2 },
        { type: 'presence', name: 'stateCode' }
    ],


    proxy: {
        type: 'ajaxproxy',
        api: {
            //read: '/Scripts/Taco/mocks/taxsettings.json',
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