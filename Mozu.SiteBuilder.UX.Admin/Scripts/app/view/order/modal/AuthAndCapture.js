/**
 * @class Taco.view.order.modal.AuthorizePayment
 */

Ext.define('Taco.view.order.modal.AuthAndCapture', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    autoShow: true,
    scale: 'small',
    title: 'Authorize and Capture Payment',

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'currencyfield',
                currencyCode: this.order.getCurrencyCode(),
                name: 'amount',
                fieldLabel: 'Amount to Authorize and Capture',
                selectOnFocus: true,
                width: 170,
                value: this.order.getNewPaymentAmountHint()
            }]
        });

        this.items = [this.form];
        
        this.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            basic = this.form.getForm(),
            formValues = this.form.getValues(),
            data,
            cfg;

        data = {
            orderId: this.order.getId(),
            paymentId: this.record.getId(),
            amount: formValues.amount
        };

        cfg = {
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    return;
                }
                me.order.reload();
                me.saveSuccess(json);
            },
            failure: function (response) {             
                me.setLoading(false, me.body);
            },
            scope: this
        };
        
        me.setLoading(true, me.body);
        this.order.authAndCapture(cfg);
    }
});
