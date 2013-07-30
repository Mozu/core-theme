/**
 * @class Taco.model.OrderPayment
 */
Ext.define('Taco.model.OrderPayment', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Ext.data.association.HasMany',
        'Ext.data.association.BelongsTo',
        'Taco.model.PaymentInteraction'
    ],
    fields: [
        {
            'name': 'id',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'orderId',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'paymentServiceTransactionId',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'status',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'amountCollected',
            'type': 'float',
            'useNull': false
        },
        {
            'name': 'amountCredited',
            'type': 'float',
            'useNull': false
        },
        {
            'name': 'amountAuthorized',
            'type': 'float',
            'useNull': false
        },
        {
            'name': 'interactions',
            'type': 'auto',
            'default': []
        },
        {
            "name": "availableActions",
            "type": "auto",
            "default": []
        },
        {
            'name': 'paymentType',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'cardType',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'cardNumber',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'nameOnCard',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'createDate',
            'type': 'date',
            'useNull': true
        },
        {
            'name': 'isManual',
            'type': 'boolean',
            'default': false
        }],

    associations: [
        {
            type: 'hasMany',
            model: 'Taco.model.PaymentInteraction',
            name: "interactions"
        }, {
            type: 'belongsTo',
            model: 'Taco.model.Order'
        }
    ]
});