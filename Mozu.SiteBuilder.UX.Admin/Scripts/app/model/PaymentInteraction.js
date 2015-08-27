/**
 * @class Taco.model.PaymentInteraction
 */
Ext.define('Taco.model.PaymentInteraction', {
    extend: 'Taco.core.data.Model',

    fields: [
    {
        'name': 'id',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'paymentId',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'gatewayTransactionId',
        'type': 'string',
        'useNull': true
    }, 
    {
        'name': 'gatewayInteractionId',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'GatewayInteractionIdReference',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'interactionType',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'status',
        'type': 'string',
        'useNull': true,
        dateFormat: 'c'
    },
    {
        'name': 'gatewayResponseCode',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'gatewayResponseText',
        'type': 'string',
        'useNull': true
    },
    {
        'name': 'amount',
        'type': 'float',
        'useNull': true
    },
    {
        'name': 'createDate',
        'type': 'date',
        'useNull': true
    },
    {
        'name': 'isManual',
        'type': 'boolean'
    },
    {
        'name': 'canEdit',
        'type': 'boolean',
        'default': false
    },
    {
        'name': 'canDelete',
        'type': 'boolean',
        'default': false
    }]
});