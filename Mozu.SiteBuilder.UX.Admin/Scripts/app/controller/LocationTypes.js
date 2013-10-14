/**
 * @class Taco.controller.Locations
 * @author Simeon Kessler
 * The Locations controller
 */

Ext.define('Taco.controller.LocationTypes', {
    extend: 'Taco.core.Controller',
    requires: [
        //'Taco.view.locationType.Edit'
    ],
    //editorView: 'Taco.view.locationType.Edit',
    //listView: null,
    models: ['Taco.model.LocationType'],
    stores: ['Taco.store.LocationTypes'],
    views: ['locationType.Index'],
    modelName: 'LocationType'
});