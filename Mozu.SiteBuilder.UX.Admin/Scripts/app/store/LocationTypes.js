/**
 * @class Taco.store.LocationTypes
 */

Ext.define('Taco.store.LocationTypes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.LocationType',
    remoteFilter: false,
    pageSize: 25,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    }
});