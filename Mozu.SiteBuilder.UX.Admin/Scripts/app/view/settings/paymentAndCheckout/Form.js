/**
 * 
 */
Ext.define('Taco.view.settings.paymentAndCheckout.Form', {
    extend: 'Taco.core.ux.form.NavForm2',
    requires: [
        'Taco.view.settings.paymentAndCheckout.Gateway',
        'Taco.view.settings.paymentAndCheckout.subform.PaymentType',
        'Taco.view.settings.paymentAndCheckout.subform.CheckoutPreference',
        'Taco.view.settings.paymentAndCheckout.subform.LegalInformation'
    ],
    title: 'Payment & Checkout',
    initComponent: function () {
        var me = this;
  
        me.paymentTypes = Ext.create('Taco.view.settings.paymentAndCheckout.subform.PaymentType', me);
        me.checkoutPrefrences = Ext.create('Taco.view.settings.paymentAndCheckout.subform.CheckoutPreference', me);
        me.legalInformation = Ext.create('Taco.view.settings.paymentAndCheckout.subform.LegalInformation', me);
        
        //me.items = [
        //    me.paymentTypes,
        //    me.checkoutPrefrences,
        //    me.legalInformation
        //];
        me.items = [
            me.paymentTypes
        ];
        me.callParent(arguments);
        this.loadNavItems();
    }
});