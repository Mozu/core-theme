Ext.define('Taco.store.SiteBuilderSearch', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.SiteBuilderSearchItem',
    remoteFilter: true,
    pageSize: 200,
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true,
        createOnly: true
    }
});