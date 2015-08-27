/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.ProductComboBox', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Product',

    pageSize: 10,
    remoteSort: true,
    remoteFilter: true,

    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'c',
        autoLoad: false,
        createOnly: true
    },

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/Product/list'
        },
        extraParams: {
            SearchType: 'picker',
            responseGroups: 'Min,Price'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success',
            messageProperty: 'message'
        },
        writer: {
            allowSingle: false,
            type: 'json'
        }
    }
});
