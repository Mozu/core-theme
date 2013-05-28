/**
* @class Taco.store.File
* @author Travis Johnson
* The Files store
*/

Ext.define('Taco.shared.store.Files', {
    extend: 'Taco.store.shared.BaseStore',
    model: 'Taco.shared.model.File',
    pageSize: 100,
    storeId: 'fileManagementFiles',
    buffered: false,
    remoteFilter: true
});