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
            items: [
            {
                xtype: "fieldcontainer",
                layout: "hbox",
                items:[
                {
                    xtype: 'textfield',
                    name: 'firstName',
                    //width: 170,
                    flex:1,
                    fieldLabel: 'First Name'
                }, {
                    xtype: 'textfield',
                    name: 'lastName',
                    margin:"0 0 0 10",
                    //width: 170,
                    flex: 1,
                    fieldLabel: 'Last Name'
                }]
            },

            {
                xtype: 'currencyfield',
                name: 'amount',
                width: 170,
                fieldLabel: 'Amount Requested',
                currencyCode: this.record.getCurrencyCode(),
                value: this.record.getNewPaymentAmountHint()
            }]
        });

        this.items = [this.form];

        this.callParent(arguments);
    },

    doSave: function () {
        var me = this,
            data = this.form.getValues();

        data.orderId = this.record.getId();

        me.setLoading({
            msg: "Saving"
        }, me.body);

        this.record.requestCheck({
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true),
                    data;

                if (!json) { return }

                data = json.items;
                me.record.reload();
                me.saveSuccess(data);
            }, 
            failure: function () {
                me.setLoading(false, me.body);
            }
        });
    }
});
