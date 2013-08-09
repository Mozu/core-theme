/**
 * @class Taco.model.Order
 */
Ext.define('Taco.model.ReturnItem', {
    extend: 'Taco.core.data.Model',
    /**********************************************************
    *   missing shipping discount object
    *   missing shipping method...
    *   
    *
    *
    ***************************************************************/
    behaviors: {
        read: 73,
        create: 74,
        update: 75,
        destroy: 76
    },
    fields: [
        {
            "name": "orderItemId",
            "type": "string",
            "useNull": true
        },
        
        {
            "name": "reason",
            "type": "string",
            "useNull": true,
            defaultValue: null

        },
        {
            "name": "quantityReceived",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        }, {
            "name": "quantityShipped",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        }, {
            "name": "quantityRestockable",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        }, {
            "name": "priceSnapshot",
            "type": "auto",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "notes",
            "type": "auto",
            "useNull": true,
            defaultValue: null
        }, {
            "name": "quantity",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        }
    ],
    idProperty: 'orderItemId'


});