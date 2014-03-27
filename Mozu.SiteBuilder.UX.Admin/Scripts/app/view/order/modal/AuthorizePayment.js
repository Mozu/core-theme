/**
 * @class Taco.view.order.modal.AuthorizePayment
 */

Ext.define('Taco.view.order.modal.AuthorizePayment', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.DateTime',
        'Taco.core.ux.form.CurrencyField'
    ],

    autoShow: true,
    scale: 'small',
    title: 'Authorize Payment',

    initComponent: function () {
        this.form = Ext.create('Taco.core.ux.form.Form', {
            layout: {
                type: 'hbox'
            },
            items: [{
                xtype: 'currencyfield',
                name: 'amount',
                fieldLabel: 'Amount to Authorize',
                selectOnFocus: true,
                width: 170,
                value: this.order.get('authorizationInfo').captureAmount
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
            callback: function() {
                me.order.reload();
            },
            scope: this
        };

        this.order.authorize(cfg);
    }
});
