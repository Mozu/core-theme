/**
 * @class Taco.model.SubPayment
 */

Ext.define('Taco.model.SubPayment', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Ext.data.association.BelongsTo'
    ],
    fields: [
        {
            "name": "status",
            "type": "string",
            "useNull": "true"
        },
        {
            name: 'amountRequested',
            type: 'float',
            useNull: false
        },
        {
            name: 'amountCollected',
            type: 'float',
            useNull: false
        },
        {
            name: 'amountCredited',
            type: 'float',
            useNull: false
        },
        {
            name: 'amountRefunded',
            type: 'float',
            useNull: false
        },
        {
            name: 'target', 
            type: 'auto', 
            useNull: true
        }
    ],
    associations: [
        {
            type: "belongsTo",
            model: "Taco.model.OrderPayment"
        }
    ]


});