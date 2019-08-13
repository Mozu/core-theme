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
            name: 'id',
            type: 'string',
            useNull: true
        },
        {
            name: 'orderId',
            type: 'string',
            useNull: true
        },
        {
            name: "billingContact",
            type: "auto",
            persist: false
        },
        {
            name: "purchaseOrderInfo",
            type: "auto",
            persist: false
        },
        {
            name: 'paymentServiceTransactionId',
            type: 'string',
            useNull: true
        },
        {
            name: 'paymentServiceCardId',
            type: 'string',
            useNull: true
        },
        {
            name: 'status',
            type: 'string',
            useNull: true
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
            name: 'amountAuthorized',
            type: 'float',
            useNull: false
        },
        {
            name: 'amountTotalCreditAndRefund',
            type: 'float',
            useNull: false
        },
        {
            // effective amount: how much was requested/authorized/captured based on payment state.
            // important for totaling how much still has to be paid on an order.
            name: 'effectiveAmount',
            type: 'float',
            useNull: false,
            convert: function(value, record) {
                if (Ext.Array.contains(['Voided', 'Declined'], record.get('status'))) return 0;

                var amount = record.get('amountCollected') || record.get('amountAuthorized') || record.get('amountRequested')
                amount -= record.get('amountCredited');

                return amount;
            }
        },
        {
            name: 'interactions',
            type: 'auto',
            defaultValue: []
        },
        {
            name: 'subpayments',
            type: 'auto',
            defaultValue: []
        },
        {
            name: "availableActions",
            type: "auto",
            defaultValue: []
        },
        {
            name: 'paymentType',
            type: 'string',
            useNull: true
        },
        {
            name: 'paymentWorkflow',
            type: 'string',
            useNull: true
        },
        {
            name: 'tokenType',
            type: 'string',
            useNull: true
        },
        {
            name: 'tokenId',
            type: 'string',
            useNull: true
        },

        {
            name: 'storeCreditCode',
            type: 'string',
            useNull: true
        },
        {
            name: 'storeCreditType',
            type: 'string',
            useNull: true
        },
        {
            name: 'customCreditType',
            type: 'string',
            useNull: true
        },
        {
            name: 'cardType',
            type: 'string',
            useNull: true
        },
        {
            name: 'cardNumber',
            type: 'string',
            useNull: true
        },
        {
            name: 'nameOnCard',
            type: 'string',
            useNull: true
        },
        {
            name: 'expireMonth',
            type: 'int',
            useNull: true
        },
        {
            name: 'expireYear',
            type: 'int',
            useNull: true
        },
        {
            name: 'createDate',
            type: 'date',
            useNull: true
        },
        {
            name: 'isManual',
            type: 'boolean',
            'default': false
        },
        {
            name: 'isDefault',
            type: 'boolean',
            'default': false
        },
        {
            name: 'isExpired',
            type: 'boolean',
            'default': false
        },
        {
            name: 'externalTransactionId',
            type: 'string',
            useNull: true
        }],

    associations: [
        {
            type: 'hasMany',
            model: 'Taco.model.PaymentInteraction',
            name: "interactions"
        }, {
            type: 'belongsTo',
            model: 'Taco.model.Order'
        },
        {
            type: 'hasMany',
            model: 'Taco.model.SubPayment',
            name: "subpayments"
        }
    ],
    setProxy: function() {
    },
    proxy: {
        type: 'ajax',
        reader: {
            type: 'json'
        },
        fonzie: 'fonzie'
    },

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

    issueCredit: function(config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/credit',
            method: "POST"
        });
        Ext.Ajax.request(config);
    },

    applyCheck: function(config) {
        Ext.applyIf(config, {
            url: '/admin/app/order/payment/applycheck',
            method: "POST"
        });
        Ext.Ajax.request(config);
    },

    getPaymentSettings: function (config) {
        Ext.applyIf(config, {
            url: '/admin/app/checkoutsettings/paymentSettings',
            method: "GET"
        });
        Ext.Ajax.request(config);
    },

    findSubPayment: function(order) {
        if (!order) return false;
        var orderId = order.get('id');

        var subpayments = this.get('subpayments') || [];
        var targetedSubpayment = Ext.Array.findBy(subpayments,
            function(subpayment) {
                if (!subpayment.target) return false;
                return subpayment.target.targetId === orderId;
            });

        return targetedSubpayment;
    }
});