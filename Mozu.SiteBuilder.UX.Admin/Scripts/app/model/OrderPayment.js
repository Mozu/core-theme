/**
 * @class Taco.model.OrderPayment
 */
Ext.define('Taco.model.OrderPayment', {
    extend: 'Taco.core.data.Model',
    requires: [
        'Ext.data.association.HasMany',
        'Ext.data.association.BelongsTo',
        'Taco.model.OrderPaymentInteraction'
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
        }, {
            type: 'belongsTo',
            model: 'Taco.model.Order'
        }
    ],
    


    /**
     * service call to add a credit on the order     
     * @param {Object} config  A configuration object     
     * config object:
        {
            jsonData: {
                orderId: "987654321",
                amount:  "100.65",
                payment:  {
                    ...payment entity members...
                }
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didnt' return data properly
                    return;
                }
            },
            failure: function (response) {
                // error handling here
            },
            scope: this
        }

     */
    issueCredit: function (config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/credit',
            method: "POST",
        });
        Ext.Ajax.request(config);
    },

    applyCheck: function (config) {

        Ext.applyIf(config, {
            url: '/admin/app/order/payment/applycheck',
            method: "POST",        
        });
        Ext.Ajax.request(config);
    }
});