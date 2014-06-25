/**
 * @class Taco.view.order.modal.AddGiftCard
 */

Ext.define('Taco.view.order.modal.AddGiftCard', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.order.widget.GiftCardForm'
    ],

    layout: 'fit',

    scale: 'large',
    title: 'Add Gift Card',

    initComponent: function () {

        this.form = Ext.create('Taco.view.order.widget.GiftCardForm', {
            store: this.storeCreditsStore,
            order: this.record
        });

        this.items = [this.form];

        this.callParent(arguments);
    },
    
    doSave: function () {
        this.setLoading({
            msg: "Applying gift cards"
        }, this.body);
        
        var me = this,
            data = {
                payments: Ext.Array.map(this.storeCreditsStore.queryBy(function(record) { return record.get('amtToApply') > 0; }).getRange(), function(record) {
                    return record.getData();
                }),
                orderId: this.record.getId(),
                customerId: this.record.get('customerId')
            };

        this.record.addGiftCards({
            jsonData: data,
            success: function(response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true),
                    data;

                if (!json) return;

                data = json.items;
                me.record.reload();
                me.saveSuccess(data);
            },
            failure: function() {
                me.setLoading(false, me.body);
            }
        });

    }


});
