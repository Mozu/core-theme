/**
 * @class Taco.view.order.modal.CheckPayment
 */

Ext.define('Taco.view.order.modal.CheckDecline', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    autoShow: true,
    scale: 'small',
    title: 'Decline Check',

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
            checkNumber: formValues.checkNumber
        };

        this.order.declineCheck({
            jsonData: data,
            success: function () {
                me.order.reload();
            }
        });
    }
});
