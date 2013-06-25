/**
 * @class Taco.model.OrderPaymentInteraction
 */
Ext.define('Taco.model.OrderPaymentInteraction', {
    extend: 'Taco.core.data.Model',

    fields: [
    {
        'name': 'id',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'gatewayInteractionId',
        'type': 'int',
        'useNull': true
    },
    {
        'name': 'gatewayInteractionIdReference',
        'type': 'int',
        'useNull': true
    },    
    {
        'name': 'interactionType',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'checkNumber',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'status',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'amount',
        'type': 'float',
        'useNull': true
    },
    {
        'name': 'paymentId',
        'type': 'string',
        'useNull': true
    }
    ,
    {
        'name': 'createDate',
        'type': 'date',
        'useNull': true
    }]

});