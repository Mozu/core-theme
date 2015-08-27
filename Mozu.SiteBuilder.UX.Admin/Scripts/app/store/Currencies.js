Ext.define('Taco.store.Currencies', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Country',
    pageSize: 800,
    remoteSort: false,
    remoteFilter: false,
    sorters: ['name'],
    storeManagerConfig: {
        createOnly: true,
        clearFilters: false,
        clearSort: false,
        autoLoad: true
    },
    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/Reference/currencies/list'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    }
});