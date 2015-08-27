/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.ProductPicker', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Product',
        pageSize: 20,
       // remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: false,
           // contextLevel: 'c',
            clearSort: false,
            autoLoad: false,
            createOnly: true

        },

        proxy: {
            type: 'ajax',
            api: {
                read: '/admin/app/Product/list'
            },
            extraParams: {
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