/**
 * @class Taco.model.OrderPayment
 */
Ext.define('Taco.model.OrderPayment', {
    extend: 'Taco.core.data.Model',

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
        'name': 'interactions',
        'type': 'auto',
        'default': []
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
    }],

    associations: [
    {
        type: 'hasMany',
        model: 'Taco.model.OrderPaymentInteraction',
        name: "interactions"
    }]

});