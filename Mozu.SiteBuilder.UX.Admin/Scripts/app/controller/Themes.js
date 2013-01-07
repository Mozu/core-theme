/**
 * @class Taco.controller.Themes
 * The Themes controller.
 */
Ext.define('Taco.controller.Themes', {
    extend: 'Taco.core.Controller',
    modelName: 'Taco.model.ThemeListing',
    requires: ['Taco.view.themes.Index'],
    views: ['themes.Index'],

    index: function (params) {
        this.createContentView('Taco.view.themes.Index');
        
    }
});
