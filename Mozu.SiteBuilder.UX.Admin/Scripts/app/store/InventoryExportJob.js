/**
 * @class Taco.store.InventoryExportJob
 */


Ext.define('Taco.store.InventoryExportJob', {
    extend: 'Ext.data.Store',
    model: 'Taco.model.InventoryExportJob',
    //pageSize: 25,
    remoteSort: false,
    remoteFilter: false,
    autoLoad: true
});
