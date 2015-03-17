Ext.define('Taco.store.StoreCreditsGrid', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.StoreCredit',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,
    proxy: {
        type: 'ajaxproxy',
        api: {
            read: '/admin/app/customer/credits/list',
            create: '/admin/app/customer/credits/create',
            update: '/admin/app/customer/credits/edit',
            destroy: '/admin/app/customer/credits/delete'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: "message"
        }
    },
    sorters: [{
        property: 'activationDate',
        direction: 'DESC'
    }]
});
