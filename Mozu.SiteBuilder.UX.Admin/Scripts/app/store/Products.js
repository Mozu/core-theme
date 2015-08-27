/**
* @class Taco.store.Products
* @author Thomas Phipps
* The Products store
*/

    Ext.define('Taco.store.Products', {
        extend: 'Ext.data.Store',
        model: 'Taco.model.Product',
        pageSize: 25,
        remoteSort: true,
        remoteFilter: true,
        storeManagerConfig: {
            clearFilters: true,
            contextLevel: 'c',
            clearSort: true,
            autoLoad: true
        },

        listeners: {
            update: function(store, record, operation, eOpts) {
                // when the product is updated, the ProductInCatalogs store needs to be reloaded.
                if (record != null && operation === Ext.data.Model.COMMIT)
                {
                    record.reloadProductInCatalogsStore();
                }
            }
        }
    });