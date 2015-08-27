Ext.define('Taco.view.settings.shipping.widget.OrderHandlingFeeRulesForm', {
    extend: 'Taco.view.settings.shipping.widget.BaseShippingConfigurationRulesForm',
    alias: 'widget.orderhandlingfeerulesform',
    requires: ['Taco.store.OrderHandlingFeeRules'],
    title: 'Order Fee Configuration',
    createRoute: 'shipping/orderHandlingFeeCreate',
    editRoute: 'shipping/orderHandlingFeeEdit',
    showFeeColumn: true,
    stateId: "statefulOrderHandlingFeeRulesGrid",
    getStore: function () {
        return Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderHandlingFeeRules');
    }
});
