Ext.define('Taco.view.settings.shipping.widget.ProductHandllingFeeRulesForm', {
    extend: 'Taco.view.settings.shipping.widget.BaseShippingConfigurationRulesForm',
    alias: 'widget.producthandllingfeerulesform',
    title: 'Product Fee Configuration',
    requires:['Taco.store.ProductHandlingFeeRules'],
    createRoute: 'shipping/productHandlingFeeCreate',
    editRoute: 'shipping/productHandlingFeeEdit',
    showFeeColumn: true,
    
    stateId: "statefulProductHandlingFeeRulesGrid",
    getStore: function () {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductHandlingFeeRules');
    },

});
