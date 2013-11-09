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

    //contextPlaceholders: {
    //    t: function () {
    //        return Ext.create('Taco.core.ux.content.Container', {
    //            header: {
    //                title: "choose a site collection"
    //            },

    //            body: {
    //                layout: 'auto',
    //                items: [{
    //                    html: 'placeholder for choose site collection interstitial '
    //                }]
    //            }
    //        });
    //    }
    //}
});







