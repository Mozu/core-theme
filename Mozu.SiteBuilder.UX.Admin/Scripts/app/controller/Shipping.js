

Ext.define('Taco.controller.Shipping', {
    extend: 'Taco.core.Controller',
    requires: [
    ],
    models: ['Taco.model.SiteShippingSettings', 'Taco.model.TargetRule'],
    views: [
        'Taco.view.settings.shipping.Zones',
        'Taco.view.settings.shipping.Edit',
        'Taco.view.settings.shipping.ProductRules',
        'Taco.view.settings.shipping.MethodsAndFees',
        'Taco.view.settings.shipping.TargetRuleEdit',
        'Taco.view.settings.shipping.ShippingMethodEditor',
        'Taco.view.settings.shipping.HandlingFeeEditor'
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
    zonesedit: function (id, additionalParams, appState) {
        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },
    zonescreate: function (id, additionalParams, appState) {
        appState = appState || {};
        delete additionalParams.record;
        appState.record = Ext.create('Taco.model.TargetRule', {
            domain: 'Shipping.DestinationAddress'
        });

        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },
    productRules: function () {
        this.createContentView('Taco.view.settings.shipping.ProductRules');
    },
    productRulesEdit: function (id, additionalParams, appState) {
        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },
    productRulesCreate: function (id, additionalParams, appState) {
        appState = appState || {};
        delete additionalParams.record;
        appState.record = Ext.create('Taco.model.TargetRule', {
            domain: 'Product'
        });
        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },

    index: function (id, additionalParams, appState) {

        this.createContentView('Taco.view.settings.shipping.MethodsAndFees');
    },

    shippingMethodCreate: function (id, additionalParams, appState) {

        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.ShippingMethodEditor', Taco.model.ShippingInclusionRule);
    },
    shippingMethodEdit: function (id, additionalParams, appState) {

        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.ShippingMethodEditor', Taco.model.ShippingInclusionRule);
    },

    productHandlingFeeCreate: function (id, additionalParams, appState) {
        appState = appState || {};
        delete additionalParams.record;
        appState.record = Ext.create('Taco.model.HandlingFeeRule', {
            appliesTo: 'product'
        });
        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.HandlingFeeRule);
    },
    productHandlingFeeEdit: function (id, additionalParams, appState) {

        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.HandlingFeeRule);
    },
    orderHandlingFeeCreate: function (id, additionalParams, appState) {
        appState = appState || {};
        delete additionalParams.record;
        appState.record = Ext.create('Taco.model.HandlingFeeRule', {
            appliesTo: 'order'
        });
        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.HandlingFeeRule);
    },
    orderHandlingFeeEdit: function (id, additionalParams, appState) {

        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.HandlingFeeRule);
    }


});