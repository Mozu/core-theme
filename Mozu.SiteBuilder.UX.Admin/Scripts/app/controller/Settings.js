Ext.define('Taco.controller.Settings', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.settings.paymentAndCheckout.Edit',
        'Taco.view.settings.tax.Edit',
        'Taco.view.settings.shipping.Edit',
        'Taco.model.SiteShippingSettings',
        'Taco.view.settings.Publishing'
    ],
    listView: null,
    models: ['Taco.model.CheckoutSettings'],

    paymentAndCheckout: function () {
        Taco.app.setLoading();
        if (!this.requiresSiteContext()) {

            Taco.model.CheckoutSettings.load(123, {
                success: function (record) {
                    Taco.app.setLoading(false);
                    this.createContentView('Taco.view.settings.paymentAndCheckout.Edit', {
                        record: record
                    });

                },
                failure: function () {
                    Taco.app.setLoading(false);
                    console.error('PaymentAndCheckout', 'failure');
                },
                scope: this
            });
        }
    },

    tax: function () {

        this.confirmContext('Taco.view.settings.tax.Edit',  function () {
            this.createContentView('Taco.view.settings.tax.Edit', {
                record: null
            });
        }, this, arguments);


       
    },

    shipping: function () {
        Taco.app.setLoading();

        if (!this.requiresSiteContext()) {

            Taco.model.SiteShippingSettings.load(123, {
                success: function (record) {
                    Taco.app.setLoading(false);
                    this.createContentView('Taco.view.settings.shipping.Edit', {
                        record: record
                    });

                },
                failure: function () {
                    Taco.app.setLoading(false);
                    console.error('shipping', 'failure');
                },
                scope: this
            });
        }
    },

    publishing: function () {
        this.createContentView('Taco.view.settings.Publishing');
    }
});