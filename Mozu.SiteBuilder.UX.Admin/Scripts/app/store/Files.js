/**
* @class Taco.store.File
* @author Travis Johnson
* The Files store
*/

Ext.define('Taco.store.Files', {
    extend: 'Taco.store.shared.BaseStore',
    model: 'Taco.model.File',
    pageSize: 100,
    storeId: 'fileManagementFiles',
    buffered: false,
    remoteFilter: true
});