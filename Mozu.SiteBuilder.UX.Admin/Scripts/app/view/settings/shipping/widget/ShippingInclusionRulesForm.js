Ext.define('Taco.view.settings.shipping.widget.ShippingInclusionRulesForm', {
    extend: 'Taco.view.settings.shipping.widget.BaseShippingConfigurationRulesForm',
    alias: 'widget.shippinginclusionrulesform',

    title: 'Shipping Methods Configuration',
    showAllMethodsWhenMethodsAreEmpty: true,

    createRoute: 'shipping/shippingMethodCreate',
    editRoute: 'shipping/shippingMethodEdit',
    getStore: function () {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.ShippingInclusionRules');
    }

});