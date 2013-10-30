/**
 * @class Taco.store.LocationTypes
 */

Ext.define('Taco.store.LocationTypes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.LocationType',
    remoteFilter: true,
    remoteSort: true,
    pageSize: 25,
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});