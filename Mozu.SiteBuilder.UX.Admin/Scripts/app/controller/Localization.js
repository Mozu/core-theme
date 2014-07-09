

Ext.define('Taco.controller.Localization', {
    extend: 'Taco.core.Controller',
    requires: [
    ],
    models: ['Taco.model.SiteShippingSettings', 'Taco.model.TargetRule',
        'Taco.model.LocalizedAttribute', 'Taco.model.LocalizedAttributeValue', 'Taco.model.LocalizedProductProperty',
        'Taco.model.LocalizedProductExtra', 'Taco.model.LocalizedProductVariant'],
    views: [
        'Taco.view.settings.localization.Attributes',
        'Taco.view.settings.localization.AttributeValues',
        'Taco.view.settings.localization.ProductProperties',
        'Taco.view.settings.localization.ProductExtras',
        'Taco.view.settings.localization.ProductVariants'
    ],
    stores: ['Taco.store.ShippingZones',
        'Taco.store.LocalizedAttributes', 'Taco.store.LocalizedAttributeValues', 'Taco.store.LocalizedProductProperties',
        'Taco.store.LocalizedProductExtras', 'Taco.store.LocalizedProductVariants'],
    listView: null,


    attributeValues: function () {
        this.createContentView('Taco.view.settings.localization.AttributeValues');
    },

    productProperties: function () {
        this.createContentView('Taco.view.settings.localization.ProductProperties');
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
    productExtras: function () {
        this.createContentView('Taco.view.settings.localization.ProductExtras');
    },
    productVariants: function () {
        this.createContentView('Taco.view.settings.localization.ProductVariants');
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
        this.createContentView('Taco.view.settings.localization.Attributes');
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