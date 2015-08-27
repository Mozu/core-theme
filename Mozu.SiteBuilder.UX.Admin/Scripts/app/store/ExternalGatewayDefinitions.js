Ext.define('Taco.store.ExternalGatewayDefinitions', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.ExternalPaymentDefinition',
    storeManagerConfig: {
    clearFilters: true,
    clearSort: true,
    autoLoad: true
}
});