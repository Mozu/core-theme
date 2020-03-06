Ext.define('Taco.store.CarrierCredentials', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.CarrierCredentials',
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
            read: '/admin/app/carriers/credentials/read',
            create: '/admin/app/carriers/credentials/create',
            update: '/admin/app/carriers/credentials/edit',
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