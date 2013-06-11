/**
 * @class Taco.controller.PaymentAndCheckout
 * Controller for payment and checkout settings.
 */
Ext.define('Taco.controller.PaymentAndCheckout', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.paymentAndCheckout.Index', 'Taco.model.PaymentAndCheckout'],
    modelName: 'Taco.model.PaymentAndCheckout',
    stores: ['GatewayDefinitions'],
    views: ['paymentAndCheckout.Index'],

    index: function ( params ) {
        var me = this;

        if (this.requiresSiteContext()) {
            return;
        }
        
        Taco.model.PaymentAndCheckout.load(123, {
            success: function ( record, o ) {
                me.createContentView('Taco.view.paymentAndCheckout.Index', { recordId: record });
            },
            failure: function () {
                console.error('PaymentAndCheckout', 'failure');
            }
        });
    }
});