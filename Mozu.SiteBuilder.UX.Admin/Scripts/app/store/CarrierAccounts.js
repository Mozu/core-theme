Ext.define('Taco.store.CarrierAccounts', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.CarrierAccountModel',
    remoteFilter: true,
    remoteSort: true,
    pageSize: 20,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: true,
        autoLoad: true
    },
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/carriers/credentialsset/read',
            destroy: '/admin/app/carriers/credentialsset/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});


