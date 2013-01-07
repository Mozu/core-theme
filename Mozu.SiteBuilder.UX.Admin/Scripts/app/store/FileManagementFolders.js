/**
* @class Taco.store.FileManagementFolders
* @author Thomas Phipps
* The FileManagementFolders store
*/


Ext.define('Taco.store.FileManagementFolders', {
    extend: 'Taco.store.shared.TreeStore',
    model: 'Taco.model.FileManagementFolder',
    autoSync: true,
    pageSize: 100,
    //  numFromEdge: 10,
    // leadingBufferZone:40,
    // trailingBufferZone:10,
    storeId: 'fileManagementFolder',
    batchUpdateMode: "operation",
    defaultRootId: 0,
    nodeParam: 'id'
//    root: {
//        expanded: true,
//        name:'All Files'
//    }
});