/**
 * @class Taco.store.LocationTypes
 */

Ext.define('Taco.store.LocationTypes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.LocationType',
    remoteFilter: false,
    remoteSort: true,
    pageSize: 25,
    clearFilters: true,
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});