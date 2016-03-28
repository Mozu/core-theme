/**
 * @class Taco.model.Card
 */
Ext.define('Taco.model.CardGateway', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "cardType",
            "type": "string",
            "useNull": true
        },
        {
            "name": "cardDisplay",
            "type": "string",
            "useNull": true
        },
        {
            "name": "isEnabled",
            "type": "bool",
            "useNull": true
        },
        {
            "name": "gatewayId",
            "type": "string",
            "useNull": true
        },
        {
            "name": "gatewayName",
            "type": "number",
            "useNull": true
        }
    ],

    proxy: {
        type: 'ajaxproxy',
        api: {
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json',
            allowSingle: false
        }
    }
});