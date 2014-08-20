/**
 * @class Taco.view.order.modal.AddGiftCard
 */

Ext.define('Taco.view.order.modal.AddGiftCard', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.order.widget.GiftCardForm',
        'Taco.store.StoreCredits'
    ],

    layout: 'fit',

    // need this layout in order for scrollbar showing up to cause the form to resize. criminy...
    layout: "anchor",

    scale: 'large',
    title: 'Add Gift Card/Store Credit',

    initComponent: function () {
        var me = this;
        
        me.storeCreditsStore = Taco.store.StoreCredits.createForCustomer(me.record.get('customerId'));
        me.storeCreditsStore.load();

        me.form = Ext.create('Taco.view.order.widget.GiftCardForm', {
            store: me.storeCreditsStore,
            order: me.record
        });

        me.items = [me.form];

        me.callParent(arguments);
    },
    
    getApplyingCreditData: function() {
        return {
            payments: Ext.Array.map(this.form.store.queryBy(function(record) { return record.get('amtToApply') > 0; }).getRange(), function(record) {
                return record.getData();
            }),
            orderId: this.record.getId(),
            customerId: this.record.get('customerId')
        };
    },

    doSave: function () {
        this.setLoading({
            msg: "Applying gift cards"
        }, this.body);
        
        var me = this,
            data = this.getApplyingCreditData();

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
