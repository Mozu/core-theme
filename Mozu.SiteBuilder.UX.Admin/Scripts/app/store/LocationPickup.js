
/**
* @class Taco.store.LocationPickup
* The LocationPickup store
*/

Ext.define('Taco.store.LocationPickup', {
    requires: ['Taco.model.LocationPickup'],
    extend: 'Ext.data.Store',
    model: 'Taco.model.LocationPickup',
    pageSize: 25,
    remoteSort: true,
    autoLoad: true,
    remoteFilter: true,
    storeManagerConfig: {
        clearFilters: true,
        createOnly:true,
        contextLevel: 'sc',
        clearSort: true,
        autoLoad: true
    }
});