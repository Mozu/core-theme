/**
 * @class Taco.view.order.modal.ManualVoidPayment
 */

Ext.define('Taco.view.order.modal.ManualVoidPayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: ['Taco.core.ux.form.DateTime'],

    autoShow: true,
    scale: 'medium',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.manual_void_payment,

    alternateClassName: ['Taco.view.order.modal.ManualDeclinePayment'],

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'container',
                defaults: {
                    margin: '0 20 0 0',
                    width: 170
                },
                items: [{
                    xtype: 'textfield',
                    name: 'gatewayInteractionId',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.gateway_interaction_id
                }, {
                    xtype: 'datetime',
                    name: 'interactionDate',
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.ManualTransaction.transaction_date
                }]
            }]
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
            gatewayInteractionId: formValues.gatewayInteractionId,
            interactionDate: formValues.interactionDate
        };

        me.setLoading({
            msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentPanel.saving
        }, me.body);

        cfg = {
            jsonData: data,
            success: function (response) {
                var json = Ext.decode(response.responseText, true);
                me.setLoading(false, me.body);

                if (!json || !json.success) {
                    return;
                }

                me.saveSuccess(json);

                me.order.reload();
            },
            failure: function () {
                me.setLoading(false, me.body);
            },
            scope: this
        };

        this.order.voidPaymentManual(cfg);
    }
});
