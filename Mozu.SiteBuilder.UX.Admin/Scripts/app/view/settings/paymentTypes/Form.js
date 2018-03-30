/**
 *
 */
Ext.define('Taco.view.settings.paymentTypes.Form', {
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.settings.paymentTypes.subform.PaymentType',
        'Taco.view.settings.paymentTypes.subform.CheckoutPreference',
        'Taco.view.settings.paymentTypes.subform.LegalInformation'
    ],
    title: 'Payment Types',
    externalGateWayDefinitionsStore: null,
    initComponent: function () {
        var me = this;

        me.creditCards = Ext.create('Taco.view.settings.paymentTypes.subform.CreditCards', me);
        me.checkByMail = Ext.create('Taco.view.settings.paymentTypes.subform.CheckByMail', me);
        me.purchaseOrder = Ext.create('Taco.view.settings.paymentTypes.subform.PurchaseOrder', me);

        me.items = [
            me.creditCards,
            me.checkByMail,
            me.purchaseOrder
        ];

        me.externalGateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ExternalGatewayDefinitions');
        me.buildExternalGateway();

        me.mon(Taco.core.StateManager, {
            beforenavigate: me.destroyThis.bind(me),
        });

        me.callParent(arguments);

        this.loadNavItems();
    },

    destroyThis: function (newState) {
        this.destroy();
    },

    buildExternalGateway: function () {
        var me = this;
        var store = this.externalGateWayDefinitionsStore;
        store.each(function (externalPayment) {
            var panel = Ext.create('Taco.view.settings.paymentTypes.subform.ExternalGateway', {
                record: me.record,
                externalPayment: externalPayment
            });
            me.items.push(panel);
        }, this);
    }
});