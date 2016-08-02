/**
 * @class Taco.controller.Categories
 * The Categories React-Redux controller.
 */

Ext.define('Taco.controller.Categories', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.categories.Index'],
    views: ['categories.Index'],
    indexView: 'Taco.view.categories.Index',
    catalog: function () {
        Taco.core.StateManager.attemptNavigate('categories');
    }
});