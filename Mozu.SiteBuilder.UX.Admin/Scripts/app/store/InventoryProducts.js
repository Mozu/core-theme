
/**
* @class Taco.store.InventoryProducts
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.InventoryProducts', {
    requires: ['Taco.model.InventoryProduct'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.InventoryProduct',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'sc',
        clearSort: true,
        autoLoad: true
    }
});