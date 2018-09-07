/**
 * @class Taco.store.SortDefintiion
 */
Ext.define('Taco.store.SortDefinition', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.SortDefinition',
    remoteFilter: true,
    pageSize: 50,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 's',
        clearSort: true,
        autoLoad: true
    },
    remoteSort: true,
    sortInfo: {
        field: 'name',
        direction: 'asc' || 'desc'
    }
});
