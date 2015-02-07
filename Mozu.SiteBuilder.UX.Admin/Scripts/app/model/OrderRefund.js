/**
 * @class Taco.model.OrderPayment
 */
Ext.define('Taco.model.OrderRefund', {
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
            name: "amount",
            type: "number"
        },
        {
            'name': 'createDate',
            'type': 'date',
            'useNull': true
        },
        {
            'name': 'createdBy',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'reason',
            'type': 'string',
            'useNull': true
        },
        {
            'name': 'payment',
            'type': 'auto'
        }
    ],
    associations: [
        {
            type: 'hasOne',
            model: 'Taco.model.OrderPayment',
            name: "payment"
        }, {
            type: 'belongsTo',
            model: 'Taco.model.Order'
        }
    ]
});