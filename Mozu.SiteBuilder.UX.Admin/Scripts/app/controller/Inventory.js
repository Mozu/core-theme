/**
 * @class Taco.controller.Inventory
 * @author Jimmy Sanford
 * The Inventory controller
 */

Ext.define('Taco.controller.Inventory', {
    extend: 'Taco.core.Controller',
    listView: null,
    models: ['Taco.model.LocationInventory'],
    stores: ['Taco.store.LocationInventories'],
    views: ['inventory.Index'],
    modelName: 'LocationInventory'
});







