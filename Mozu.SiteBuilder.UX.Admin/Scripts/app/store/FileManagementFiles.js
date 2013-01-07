/**
* @class Taco.store.FileManagementFiles
* @author Thomas Phipps
* The FileManagementFiles store
*/


Ext.define('Taco.store.FileManagementFiles', {
    extend: 'Taco.store.shared.BaseStore',
    model: 'Taco.model.FileManagementFile',
    pageSize: 100,
    //  numFromEdge: 10,
    // leadingBufferZone:40,
    // trailingBufferZone:10,
    storeId: 'fileManagementFiles',
    buffered: false,
    remoteFilter: true
    // remoteSort: true
});