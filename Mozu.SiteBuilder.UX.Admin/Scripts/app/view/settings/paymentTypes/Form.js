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
        
        me.items = [
            me.creditCards,
            me.checkByMail
        ];

        me.externalGateWayDefinitionsStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ExternalGatewayDefinitions');
        me.buildExternalGateway();

        me.callParent(arguments);

        this.loadNavItems();

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