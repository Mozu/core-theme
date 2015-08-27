/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

    Ext.define('Taco.store.ProductGrid', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Product',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: false,
            contextLevel: 'c',
            clearSort: false,
            autoLoad: true
        }        
    });