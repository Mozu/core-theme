/**
 * @class Taco.controller.Locations
 * @author Simeon Kessler
 * The Locations controller
 */

Ext.define('Taco.controller.Locations', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.location.Index',
        'Taco.view.location.Edit'
    ],
    editorView: 'Taco.view.location.Edit',
    listView: null,
    models: ['Taco.model.Location'],
    stores: ['Taco.store.Locations'],
    views: ['location.Index'],
    modelName: 'Location'
});