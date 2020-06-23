/**
 * @class Taco.view.order.modal.ManualCreditPayment
 */

Ext.define('Taco.view.order.modal.ManualCreditPayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    autoShow: true,
    scale: 'medium',    
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.manual_transaction_credit_payment,

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {            
            items: [
                {
                    xtype: 'textfield',
                    name: 'gatewayInteractionId',
                    anchor:'0',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.gateway_interaction_id
                }, {
                    xtype: 'currencyfield',
                    currencyCode: this.order.getCurrencyCode(),
                    name: 'amount',
                    width:200,
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.amount_captured,
                    value: this.record.data.amountAuthorized,
                    
                }, {
                    xtype: 'datetime',
                    name: 'interactionDate',
                    width: 200,
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.transaction_date
                }
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {
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
            msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentPanel.saving
        }, me.body);

        cfg = {
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);

                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    return;
                }                
                me.order.reload();
                me.saveSuccess(json)
            },
            failure: function () {
                me.setLoading(false, me.body);
            },
            scope: this
        };

        this.order.creditPaymentManual(cfg);
    }
});
