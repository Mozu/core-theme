/**
 * @class Taco.model.PaymentActionTarget
 */

Ext.define('Taco.model.PaymentActionTarget', {
    extend: 'Taco.core.data.Model', 
    requires: [
        'Ext.data.association.BelongsTo'
    ],
    fields: [
        {
            "name": "targetType", 
            "type": "string", 
            "useNull": "true"
        },
        {
            "name": "targetId", 
            "type": "string",
            "useNull": "true"
        },
        {
            "name": "targetNumber",
            "type": "int",
            "useNull": "true"
        }
    ], 
    associations: [
        {
            type: "belongsTo",
            model: "Taco.model.PaymentInteraction"
        }, 
        {
            type: "belongsTo", 
            model: "Taco.model.SubPayment"
        }
    ]


});