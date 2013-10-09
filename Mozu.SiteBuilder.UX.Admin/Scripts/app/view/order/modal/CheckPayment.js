/**
 * @class Taco.view.order.modal.CheckPayment
 */

Ext.define('Taco.view.order.modal.CheckPayment', {
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
                margin: '0 20 0 0',
                width: 170
            },
            items: [{
                xtype: 'textfield',
                name: 'checkNumber',
                fieldLabel: 'Check Number'
            }, {
                xtype: 'currencyfield',
                name: 'amount',
                fieldLabel: 'Amount Collected',
                value: this.record.data.amountAuthorized,
                margin: '0 0 0 0'
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
            data;

        data = {
            orderId: this.order.getId(),
            paymentId: this.record.getId(),
            checkNumber: formValues.checkNumber,
            amount: formValues.amount
        };

        this.order.applyCheck({
            jsonData: data,
            success: function () {
                me.order.reload();
            }
        });
    }
});
