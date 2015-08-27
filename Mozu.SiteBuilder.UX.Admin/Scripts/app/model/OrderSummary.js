/**
 * @class Taco.model.OrderSummary
 */
Ext.define('Taco.model.OrderSummary', {
    extend: 'Taco.core.data.Model',

    fields: [{
        "name": "id",
        "type": "int",
        "useNull": true
    }, {
        "name": "orderDate",
        "type": "date",
        "useNull": true,
        dateFormat: 'c'
    }, {
        "name": "shipDate",
        "type": "date",
        "useNull": true,
        dateFormat: 'c'
    }, {
        "name": "firstName",
        "type": "string",
        "useNull": true
    }, {
        "name": "lastName",
        "type": "string",
        "useNull": true
    }, {
        "name": "orderAmount",
        "type": "number",
        "useNull": true
    }, {
        "name": "status",
        "type": "string",
        "useNull": true
    }],

    proxy: {
        type: 'memory'
    }
});