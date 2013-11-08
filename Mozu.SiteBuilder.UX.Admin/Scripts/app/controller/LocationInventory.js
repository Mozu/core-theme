/**
 * @class Taco.controller.LocationInventory 
 * The Locations Inventory controller
 */

Ext.define('Taco.controller.LocationInventory', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.location.inventory.Index'
    ],
    models: ['Taco.model.InventoryProduct'],
    stores: ['Taco.store.InventoryProducts'],
    views: ['location.inventory.Index'],
    modelName: 'InventoryProduct',
    indexView: 'Taco.view.location.inventory.Index'
});