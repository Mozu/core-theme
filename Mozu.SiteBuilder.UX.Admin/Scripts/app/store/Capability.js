Ext.define('Taco.store.Capability', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Capability',
    remoteFilter: true,
    remoteSort: true,
    pageSize: 25,
    groupField: "capabilityName",
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});