/**
* @class Taco.store.Attributes
* @author Travis Johnson
* The Attributes Store
*/

Ext.define('Taco.store.Attributes', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.Attribute',
    //do not change
    pageSize: 2000,
    remoteSort: false,
    remoteFilter: false,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'mc',
        clearSort: true,
        autoLoad: true
    }
});