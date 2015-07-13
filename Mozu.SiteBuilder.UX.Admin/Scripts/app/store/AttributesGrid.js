/**
* @class Taco.store.Attributes
* @author Travis Johnson
* The Attributes Store
*/

Ext.define('Taco.store.AttributesGrid', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Attribute',
    pageSize: 50,
    remoteSort: true,
    remoteFilter: true,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: true,
        autoLoad: true
    }
});