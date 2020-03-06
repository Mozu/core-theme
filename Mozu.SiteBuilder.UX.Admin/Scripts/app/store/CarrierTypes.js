Ext.define('Taco.store.Carriertypes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.CarrierAccountList',
    remoteFilter: true,
    remoteSort: false,
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
            read: '/admin/app/carriers/credentialsset/List',
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