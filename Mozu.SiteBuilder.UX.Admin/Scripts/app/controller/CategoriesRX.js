/**
 * @class Taco.controller.Synonyms
 * The Synonyms controller.
 */

Ext.define('Taco.controller.CategoriesRx', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.category.Index'],
    indexView: 'Taco.view.category.Index',
    site: function () {
        Taco.core.StateManager.attemptNavigate('categoriesRx');
    }
});