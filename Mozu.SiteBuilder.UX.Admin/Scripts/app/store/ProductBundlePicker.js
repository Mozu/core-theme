/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.ProductBundlePicker', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Product',

    pageSize: 10,
    remoteSort: true,
    remoteFilter: true,

    storeManagerConfig: {
        clearFilters: false,
        contextLevel: 'sc',
        autoLoad: false,
        createOnly: true
    },

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/Product/list'
        },
        extraParams: {
            responseGroups: 'Min,Price',
            ShowProductUsages: ['Standard', 'Component']
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
