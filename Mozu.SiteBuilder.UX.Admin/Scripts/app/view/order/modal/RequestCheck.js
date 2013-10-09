/**
 * @class Taco.view.order.modal.RequestCheck
 */

Ext.define('Taco.view.order.modal.RequestCheck', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.CurrencyField'
    ],
    
    autoShow: true,
    scale: 'medium',
    title: 'Request Check',

    initComponent: function () {
        this.form = Ext.create('Ext.form.Panel', {
            layout: {
                type: 'hbox'
            },
            defaults: {
                margin: '0 25 0 0',
                width: 170
            },
            items: [{
                xtype: 'textfield',
                name: 'firstName',
                fieldLabel: 'First Name'
            }, {
                xtype: 'textfield',
                name: 'lastName',
                fieldLabel: 'Last Name'
            }, {
                xtype: 'currencyfield',
                name: 'amount',
                fieldLabel: 'Amount Requested',
                value: this.record.get('total'),
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
            data = this.form.getValues();

        data.orderId = this.record.getId();

        this.record.requestCheck({
            jsonData: data,
            success: function() {
                me.record.reload();
            }
        });
    }
});
