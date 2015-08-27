/**
 * @class Taco.view.order.modal.DeclineCheck
 */

Ext.define('Taco.view.order.modal.DeclineCheck', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],
    alternateClassName: ['Taco.view.order.modal.DeclinePayment'],

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

    },

    doSave: function () {
        var me = this,
            formValues = this.form.getValues(),
            data;

        data = {
            orderId: this.order.getId(),
            paymentId: this.record.getId(),
            checkNumber: formValues.checkNumber
        };

        me.setLoading(true, me.body);

        this.order.declineCheck({
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    return
                }
                me.order.reload();
                me.saveSuccess(json);
            },
            failure: function (response) {             
                me.setLoading(false, me.body);
            },
            scope: me
        });
    }
});
