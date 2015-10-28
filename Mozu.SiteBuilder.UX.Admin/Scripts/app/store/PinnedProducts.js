/**
 * @class Taco.store.PinnedProducts
 */

    Ext.define('Taco.store.PinnedProducts', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.PinnedProduct',
        remoteFilter: true,
        pageSize: 100,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 's',
            clearSort: true,
            autoLoad: true
        },
        remoteSort: true,
        sortInfo: {
            field: 'name',
            direction: 'asc' || 'desc'
        },
        proxy: {
            type: 'ajaxproxy',
            api: {
                //read: '/admin/Scripts/app/mocks/discounts.json',
                read: '/admin/app/discount/list',
                create: '/admin/app/discount/create',
                update: '/admin/app/discount/edit',
                destroy: '/admin/app/discount/delete'
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
