/**
 * @class Taco.view.order.modal.ManualCapturePayment
 */

Ext.define('Taco.view.order.modal.ManualCapturePayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    autoShow: true,
    scale: 'medium',
    title: 'Manual Transaction: Capture Payment',

    initComponent: function() {
        var amountRequested = 0;

        // Defer to subpayment amounts if one exists that matches the id of this order. 
        if (this.record.get('subpayments')) {
            var subpaymentForThisOrder = this.record.findSubPayment(this.order);

            if (subpaymentForThisOrder) {
                amountRequested = subpaymentForThisOrder.amountRequested;
            } else {
                amountRequested = this.record.get('amountRequested');
            }
        }

        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'vbox'
            },
            items: [{
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                defaults: {
                    margin: '0 25 0 0',
                    width: 230
                },
                items: [{
                    xtype: 'textfield',
                    name: 'gatewayInteractionId',
                    fieldLabel: 'Gateway Interaction Id'
                }, {
                    xtype: 'currencyfield',
                    currencyCode: this.order.getCurrencyCode(),
                    name: 'amount',
                    fieldLabel: 'Amount Captured',
                    value: amountRequested,
                    margin: '0 0 0 0'
                }]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox'
                },
                defaults: {
                    width: 230
                },
                items: [{
                    xtype: 'datetime',
                    name: 'interactionDate',
                    fieldLabel: 'Transaction Date'
                }]
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function() {
        var me = this,
            formValues = this.form.getValues(),
            data,
            cfg;

        data = {
            orderId: this.order.getId(),
            paymentId: this.record.getId(),
            amount: formValues.amount,
            gatewayInteractionId: formValues.gatewayInteractionId,
            interactionDate: formValues.interactionDate
        };

        me.setLoading({
            msg: "Saving"
        }, me.body);

        // package up the data for the model to persist
        cfg = {
            jsonData: data,
            success: function(response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    // service didn't return data properly
                    return;
                }

                me.order.reload();
                me.saveSuccess(json);
            },
            failure: function() {
                me.setLoading(false, me.body);
            },
            scope: this
        };

        // call the model method to persist the change
        this.order.capturePaymentManual(cfg);
    }
});
