/**
 * @class Taco.view.order.modal.VoidPaymentManual
 */

Ext.define('Taco.view.order.modal.VoidPaymentManual', {
    extend: 'Taco.core.ux.window.Modal',
    requires: ['Taco.core.ux.form.DateTime'],

    autoShow: true,
    scale: 'medium',
    title: 'Manual Transaction: Void Payment',

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

        this.on({
            save: {
                scope: this,
                fn: 'save'
            }
        });
    },

    save: function () {
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

        cfg = {
            jsonData: data,
            success: function (response) {
                var json = Ext.decode(response.responseText, true);

                if (!json || !json.success) {
                    return;
                }
                me.order.reload();
            },
            failure: Ext.emptyFn,
            scope: this
        };

        this.order.voidPaymentManual(cfg);
    }
});
