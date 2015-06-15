/**
 * @class  Taco.controller.Discounts
 * The Discounts controller.
 */
Ext.define('Taco.controller.CustomRoutes', {
    extend: 'Taco.core.Controller',
    alias: ['Taco.controller.Customroutes'],
    requires: [
         'Taco.view.customroutes.Index'
    ],
    indexView: 'Taco.view.customroutes.Index'
});

