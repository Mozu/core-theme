/**
 * @class Taco.controller.LocationInventory 
 * The Locations Inventory controller
 */

Ext.define('Taco.controller.LocationInventory', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.location.inventory.Index'
    ],
    models: ['Taco.model.LocationInventory'],
    stores: ['Taco.store.LocationInventories'],
    views: ['location.inventory.Index'],
    modelName: 'LocationInventory',
    indexView: 'Taco.view.location.inventory.Index'
});
