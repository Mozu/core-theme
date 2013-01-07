/**
* @class Taco.store.InventoryProducts
* @author Thomas Phipps
* The InventoryProducts store
*/

Ext.define('Taco.store.InventoryProducts', {
    requires:['Taco.model.InventoryProduct'],
    extend: 'Taco.store.shared.BaseStore',
    model: 'Taco.model.InventoryProduct',
    autoLoad: true,
    pageSize: 25,
    remoteSort: true,
    remoteFilter: true
});
