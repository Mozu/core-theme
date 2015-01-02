/**
 * @class Taco.view.order.modal.ApplyCheck
 */

Ext.define('Taco.view.order.modal.ApplyCheck', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    autoShow: true,
    scale: 'small',
    title: 'Collect Check',

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'hbox'
            },
            defaults: {
                
                flex: 1
            },
            items: [{
                xtype: 'textfield',
                name: 'checkNumber',
                fieldLabel: 'Check Number',
                margin: '0 10 0 0'
            }, {
                xtype: 'currencyfield',
                currencyCode: this.order.getCurrencyCode(),
                name: 'amount',
                fieldLabel: 'Amount Collected',                
                value: Math.min(this.record.data.amountRequested, this.order.getCaptureAmountHint())
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            formValues = this.form.getValues(),
            data;

        data = {
            orderId: this.order.getId(),
            paymentId: this.record.getId(),
            checkNumber: formValues.checkNumber,
            amount: formValues.amount
        };

        me.down('#primaryAction').hide();

        this.order.applyCheck({
            jsonData: data,
            callback: function () {
                var btn = me.down('#primaryAction');
                if (btn) btn.show();
            },
            success: function (response) {
                var json = Ext.decode(response.responseText, true),
                    data;

                if (!json || !json.success) {                
                    return;
                }
                
                data = json.items;
                me.order.reload();
                me.saveSuccess(data);
            }
        });
    }
});
