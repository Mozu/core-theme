/**
 * @class Taco.store.Applications
 */

Ext.define('Taco.store.Applications', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Application',
    remoteFilter: true,
    remoteSort: true,
    pageSize: 25,
    groupField: "capabilityTypeName",
    storeManagerConfig: {
        clearFilters: true,
        clearSort: true,
        autoLoad: true
    }
});