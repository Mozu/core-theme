/**
 * @class Taco.store.StorefrontProducts
 */

    Ext.define('Taco.store.StorefrontProducts', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.StorefrontProduct',
        remoteFilter: true,
        pageSize: 25,
        options: [],
        storeManagerConfig: {
            clearFilters: false,
            contextLevel: 's',
            clearSort: false,
            autoLoad: false
        },
        remoteSort: true,
        proxy: {
            type: 'ajaxproxy',
            api: {
                read: '/admin/app/productruntime/preview'
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
