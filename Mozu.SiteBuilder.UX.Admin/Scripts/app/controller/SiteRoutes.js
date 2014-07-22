/**
 * @class Taco.controller.Locations
 * @author bing bang
 * The Locations controller
 */

Ext.define('Taco.controller.SiteRoutes', {
    extend: 'Taco.core.Controller',
    alias: ['Taco.controller.Siteroutes'],
    requires: [
        'Taco.view.siteRoutes.Index'
    ],
    indexView: 'Taco.view.siteRoutes.Index',
    models: ['Taco.model.SiteRouteEntry'],
    //views: ['locationType.Index'],
    modelName: 'Site Routes'
});