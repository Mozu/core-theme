

Ext.define('Taco.controller.Shipping', {
    extend: 'Taco.core.Controller',
    requires: [
    ],
    models: ['Taco.model.SiteShippingSettings', 'Taco.model.TargetRule'],
    views: [
        'Taco.view.settings.shipping.Zones',
        'Taco.view.settings.shipping.Edit',
        'Taco.view.settings.shipping.ProductRules',
        'Taco.view.settings.shipping.Configuration'
    ],
    stores: ['Taco.store.ShippingZones'],
    listView: null,


    carriers: function () {
        Taco.app.setLoading();

        if (!this.requiresSiteContext()) {

            Taco.model.SiteShippingSettings.load(123, {
                success: function (record, o) {
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

    zones: function () {
        this.createContentView('Taco.view.settings.shipping.Zones');
    },
    productRules: function () {
        this.createContentView('Taco.view.settings.shipping.ProductRules');
    },
    configuration: function () {
        this.createContentView('Taco.view.settings.shipping.Configuration');
    }
});