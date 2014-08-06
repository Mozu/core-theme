Ext.define('Taco.controller.Shipping', {
    extend: 'Taco.core.Controller',
    requires: [
    ],
    models: [
        'Taco.model.SiteShippingSettings',
        'Taco.model.TargetRule'
    ],
    views: [
        'Taco.view.settings.shipping.Zones',
        'Taco.view.settings.shipping.Edit',
        'Taco.view.settings.shipping.ProductRules',
        'Taco.view.settings.shipping.MethodsAndFees',
        'Taco.view.settings.shipping.TargetRuleEdit',
        'Taco.view.settings.shipping.ShippingMethodEditor',
        'Taco.view.settings.shipping.HandlingFeeEditor',
        'Taco.model.ProductHandlingFeeRule',
        'Taco.model.OrderHandlingFeeRule'

    ],
    stores: ['Taco.store.ShippingZones'],
    listView: null,


    carriers: function () {
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

    zones: function () {

        this.confirmContext('Taco.view.settings.shipping.Zones', function () {
            this.createContentView('Taco.view.settings.shipping.Zones');
        });

    },
    zonesedit: function (id, additionalParams, appState) {
        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },
    zonescreate: function (id, additionalParams, appState) {
        var appStateData = {
            domain: 'Shipping.DestinationAddress'
        };
        if (additionalParams && additionalParams.duplicateSource) {
            appStateData.description = additionalParams.duplicateSource.description;
            appStateData.expression = additionalParams.duplicateSource.expression;
        }

        appState = appState || {};
        delete additionalParams.record;

        appState.record = Ext.create('Taco.model.TargetRule', appStateData);

        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },
    productRules: function () {
        this.confirmContext('Taco.view.settings.shipping.Zones', function () {
            this.createContentView('Taco.view.settings.shipping.ProductRules');
        });

    },
    productRulesEdit: function (id, additionalParams, appState) {
        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },
    productRulesCreate: function (id, additionalParams, appState) {
        var appStateData = {
            domain: 'Product'
        };
        if (additionalParams && additionalParams.duplicateSource) {
            appStateData.description = additionalParams.duplicateSource.description;
            appStateData.expression = additionalParams.duplicateSource.expression;
        }

        appState = appState || {};
        delete additionalParams.record;
        appState.record = Ext.create('Taco.model.TargetRule', appStateData);
        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.TargetRuleEdit', Taco.model.TargetRule);
    },

    index: function () {

        this.confirmContext('Taco.view.settings.shipping.Zones', function () {
            this.createContentView('Taco.view.settings.shipping.MethodsAndFees');
        });

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
        appState.record = Ext.create('Taco.model.ProductHandlingFeeRule', {
            appliesTo: 'product'
        });
        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.ProductHandlingFeeRule);
    },
    productHandlingFeeEdit: function (id, additionalParams, appState) {


        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.ProductHandlingFeeRule);
    },
    orderHandlingFeeCreate: function (id, additionalParams, appState) {
        appState = appState || {};
        delete additionalParams.record;
        appState.record = Ext.create('Taco.model.OrderHandlingFeeRule', {
            appliesTo: 'order'
        });
        this.doCreate(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.OrderHandlingFeeRule);
    },
    orderHandlingFeeEdit: function (id, additionalParams, appState) {

        this.doEdit(id, additionalParams, appState, 'Taco.view.settings.shipping.HandlingFeeEditor', Taco.model.OrderHandlingFeeRule);
    }


});