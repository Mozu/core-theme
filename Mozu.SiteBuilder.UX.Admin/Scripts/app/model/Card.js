/**
 * @class Taco.model.Card
 */
Ext.define('Taco.model.Card', {
    extend: 'Taco.core.data.Model',

    fields: [
        {
            "name": "id",
            "type": "string",
            "useNull": true
        },
        {
            "name": "nameOnCard",
            "type": "string",
            "useNull": true
        },
        {
            "name": "cardNumberPart",
            "type": "string",
            "useNull": true
        },
        {
            "name": "cardType",
            "type": "string",
            "useNull": true
        },
        {
            "name": "contactId",
            "type": "number",
            "useNull": true
        },
        {
            "name": "expireMonth",
            "type": "number",
            "useNull": true
        },
        {
            "name": "expireYear",
            "type": "number",
            "useNull": true
        }
    ]
});