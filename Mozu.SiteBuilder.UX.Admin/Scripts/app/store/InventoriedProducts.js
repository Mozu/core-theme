/**
* @class Taco.store.InventoriedProducts
* Products which are capable of "manageStock".
*/

Ext.define('Taco.store.InventoriedProducts', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Product',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'sc',
        clearSort: true,
        autoLoad: true
    },

    proxy: {
        type: 'ajax',
        api: {
            read: '/admin/app/Product/inventoriedproductlist'
        },
        extraParams: {
            responseGroups: 'Min,Price,VariationOptions'
            
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
