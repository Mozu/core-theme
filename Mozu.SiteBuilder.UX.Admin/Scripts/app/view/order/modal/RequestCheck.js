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
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.request_check,

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
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.first_name
                }, {
                    xtype: 'textfield',
                    name: 'lastName',
                    margin:"0 0 0 10",
                    //width: 170,
                    flex: 1,
                    fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.last_name
                }]
            },

            {
                xtype: 'currencyfield',
                name: 'amount',
                width: 170,
                fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.amount_requested,
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
            msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentPanel.saving
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
