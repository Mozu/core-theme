/**
 * @class Taco.controller.CategoriesBeta
 * The Categories React-Redux controller.
 */

Ext.define('Taco.controller.BetaCategories', {
    extend: 'Taco.core.Controller',
    modelName: 'Category',
    requires: ['Taco.view.betacategories.Index', 'Taco.view.category.Edit'],
    editorView: 'Taco.view.category.Edit',
    views: ['Taco.view.betacategories.Index'],
    indexView: 'Taco.view.betacategories.Index',
    catalog: function () {
        Taco.core.StateManager.attemptNavigate('betacategories');
    }
});