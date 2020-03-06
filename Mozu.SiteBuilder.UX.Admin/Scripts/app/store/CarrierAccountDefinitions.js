Ext.define('Taco.store.CarrierAccountDefinitions', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.CarrierAccountDefinitions',
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});