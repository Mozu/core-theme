/**
 * @class Taco.controller.LocationAttributes
 * The Location controller.
 */
Ext.define('Taco.controller.LocationAttributes', {
    extend: 'Taco.core.Controller',
    alias: 'Taco.controller.Locationattributes',
    requires: ['Taco.view.locationAttribute.Index', 'Taco.view.locationAttribute.Edit'],
    modelName: 'LocationAttribute',
    models: ['Taco.model.LocationAttribute'],
    stores: ['Taco.store.LocationAttributes'],
    views: ['locationAttribute.Index'],
    indexView: 'Taco.view.locationAttribute.Index',
    editorView: 'Taco.view.locationAttribute.Edit'
});