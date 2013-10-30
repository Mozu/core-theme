Ext.define('Taco.store.WishList', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.WishList',
    pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: true,
           
            clearSort: true,
            autoLoad: true
        }
});