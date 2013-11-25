    Ext.define('Taco.store.StoreCredits', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.StoreCredit',
        pageSize: 50,
        remoteSort: true,
        remoteFilter: true
    });
