Ext.define('Taco.controller.Settings', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.settings.paymentTypes.Edit',
        'Taco.view.settings.discounts.Index',
        'Taco.view.settings.paymentGateways.Index',
        'Taco.view.settings.paymentGateways.Edit',
        'Taco.view.settings.inventoryExportJob.Index',
        'Taco.view.settings.inventoryExportJob.Edit',
        'Taco.view.settings.tax.Edit',
        'Taco.view.settings.shipping.Edit',
        'Taco.model.SiteShippingSettings',
        'Taco.view.settings.publishing.Edit'
    ],
    listView: null,
    models: [
        'Taco.model.CheckoutSettings',
        'Taco.model.PaymentGateway',
        'Taco.model.InventoryExportJob',
    ],

    discounts: function () {
        if (!this.requiresCatalogContext()) {
            this.createContentView('Taco.view.settings.discounts.Index');
        }
    },

    paymentTypes: function () {
        Taco.app.setLoading();
        if (!this.requiresSiteContext()) {

            Taco.model.CheckoutSettings.load(123, {
                success: function (record) {
                    Taco.app.setLoading(false);
                    this.createContentView('Taco.view.settings.paymentTypes.Edit', {
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

    paymentGateways: function() {
        if (!this.requiresSiteContext()) {

            this.createContentView('Taco.view.settings.paymentGateways.Index');
        }
    },

    inventoryExportJob: function () { 
        if (!this.requiresSiteContext()) {

            this.createContentView('Taco.view.settings.inventoryExportJob.Index');
        }
    },

    paymentgatewaysedit: function (id, additionalParams, appState) {
        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.paymentGateways.Edit', Taco.model.PaymentGateway);
    },

    paymentgatewayscreate: function (id, additionalParams, appState) {
        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.paymentGateways.Edit', Taco.model.PaymentGateway);
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
        this.createContentView('Taco.view.settings.publishing.Edit');
    }
});