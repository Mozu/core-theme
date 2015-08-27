/**
 * @class Taco.controller.Locations
 * @author bing bang
 * The Locations controller
 */

Ext.define('Taco.controller.Redirects', {
    extend: 'Taco.core.Controller',
    requires: [
        'Taco.view.redirects.Index'
    ],
    indexView: 'Taco.view.redirects.Index',
    models: ['Taco.model.RedirectEntry'],
    stores: ['Taco.store.RedirectEntries'],
    //views: ['locationType.Index'],
    modelName: 'Redirect Entry'
});