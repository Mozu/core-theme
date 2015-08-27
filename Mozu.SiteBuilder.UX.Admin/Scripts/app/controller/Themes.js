/**
 * @class Taco.controller.Themes
 * The Themes controller.
 */
Ext.define('Taco.controller.Themes', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.ThemeListing',
    requires: ['Taco.view.theme.Index'],
    views: ['theme.Index']   
});
