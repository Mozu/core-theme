Ext.define('Taco.store.Capability', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Capability',
    remoteFilter: false,
    remoteSort: false,
    remoteGroup: false,
    pageSize: 25,
    groupField: "capabilityName",
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true,
        createOnly: true
    }
});