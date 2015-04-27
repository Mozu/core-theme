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
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "lineId",
            "type": "int",
            "useNull": false
        },
        {
            "name": "orderItemId",
            "type": "string",
            "useNull": true
        },
        {
            "name": "productCode",
            "type": "string",
            "useNull": true
        },
        {
            "name": "rmaNote",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "returnReason",
            "type": "string",
            "useNull": true,
            defaultValue: null
        },
        {
            "name": "quantity",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        },
        {
            "name": "quantityReceived",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        },
        {
            "name": "quantityRestockable",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        },
        {
            "name": "quantityShipped",
            "type": "number",
            "useNull": true,
            defaultValue: 0
        },
        {
            "name": "productLossAmount",
            "type": "number",
            "useNull": false,
            defaultValue: 0
        },
        {
            "name": "productLossTaxAmount",
            "type": "number",
            "useNull": false,
            defaultValue: 0
        },
        {
            "name": "shippingLossAmount",
            "type": "number",
            "useNull": false,
            defaultValue: 0
        },
        {
            "name": "shippingLossTaxAmount",
            "type": "number",
            "useNull": false,
            defaultValue: 0
        }
    ]
});