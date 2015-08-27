/**
 * @class Taco.view.order.modal.ManualVoidPayment
 */

Ext.define('Taco.view.order.modal.ManualVoidPayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: ['Taco.core.ux.form.DateTime'],

    autoShow: true,
    scale: 'medium',
    title: 'Manual Transaction: Void Payment',

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
                    fieldLabel: 'Gateway Interaction Id'
                }, {
                    xtype: 'datetime',
                    name: 'interactionDate',
                    fieldLabel: 'Transaction Date'
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
            msg: "Saving"
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
