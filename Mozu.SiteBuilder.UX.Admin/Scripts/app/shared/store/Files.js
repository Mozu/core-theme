/**
* @class Taco.store.File
* @author Travis Johnson
* The Files store
*/

Ext.define('Taco.shared.store.Files', {
    extend: 'Taco.store.shared.BaseStore',
    model: 'Taco.shared.model.File',
    pageSize: 20,
   
    buffered: false,
    remoteFilter: true,
    remoteSort: true,
    storeManagerConfig: {
        clearFilters: true,
        contextLevel: 'c',
        clearSort: true,
        autoLoad: true
    }
});