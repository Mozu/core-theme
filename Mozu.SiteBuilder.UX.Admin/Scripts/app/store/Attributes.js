/**
* @class Taco.store.Attributes
* @author Travis Johnson
* The Attributes Store
*/

Ext.define('Taco.store.Attributes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Attribute',
    pageSize: 600,
    remoteSort: false,
    remoteFilter: false,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'c',
        clearSort: true,
        autoLoad: true
    }
});