/**
 * @class Taco.view.order.modal.AddGiftCard
 */

Ext.define('Taco.view.order.modal.AddEcommerceGiftCard', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.view.order.widget.EcommerceGiftCardForm',
        'Taco.store.StoreCredits'
    ],

    layout: 'fit',

    // need this layout in order for scrollbar showing up to cause the form to resize. criminy...
    layout: "anchor",

    scale: 'large',
    title: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.PaymentMethod.add_ecommerce_gift_card,

    initComponent: function () {
        var me = this;

        me.storeCreditsStore = Taco.store.StoreCredits.createForCustomer(me.record.get('customerId'), {}, true);
        me.storeCreditsStore.load();

        me.form = Ext.create('Taco.view.order.widget.EcommerceGiftCardForm', {
            store: me.storeCreditsStore,
            order: me.record
        });

        me.items = [me.form];

        me.callParent(arguments);
    },

    getApplyingCreditData: function () {
        return {
            payments: Ext.Array.map(this.form.store.queryBy(function (record) { return record.get('amtToApply') > 0; }).getRange(), function (record) {
                return record.getData();
            }),
            orderId: this.record.getId(),
            customerId: this.record.get('customerId')
        };
    },

    doSave: function () {
        this.setLoading({
            msg: Localizer.langResources.ORDERS.Orders.OrderEdit.Payments.Message.applying_gift_cards
        }, this.body);

        var me = this,
            data = this.getApplyingCreditData();

        this.record.addStoreCredits({
            jsonData: data,
            success: function (response) {
                me.setLoading(false, me.body);
                var json = Ext.decode(response.responseText, true),
                    data;

                if (!json) return;

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
