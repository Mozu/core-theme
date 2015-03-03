/**
* @class Taco.store.ProductTypesPicker
* The productTypes store used by the productTypePicker;
* has its own proxy to avoid conflicts with other stores;
*/

Ext.define('Taco.store.ProductTypesPicker', {
    requires:['Taco.model.ProductType'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.ProductType',
    pageSize: 10,
    buffered: false,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        contextLevel:'mc',
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    },
    proxy: {
        type: 'ajaxproxy',
        contextLevel: 'm',
        deferCacheCallback: false,
        api: {
            read: '/admin/app/ProductType/read'
        },
        reader: {
            type: 'json',
            root: 'items',
            successProperty: 'success'
        },
        writer: {
            type: 'json',
            allowSingle: false
        }
    }
});