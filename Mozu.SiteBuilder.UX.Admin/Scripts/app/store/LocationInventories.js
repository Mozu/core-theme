
/**
* @class Taco.store.LocationInventories
* @author Thomas Phipps
* The Products store
*/

Ext.define('Taco.store.LocationInventories', {
    requires: ['Taco.model.LocationInventory'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.LocationInventory',
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'sc',
        clearSort: true,
        autoLoad: false,
        extraParams: { params: { useVariations: true } }
    }
});