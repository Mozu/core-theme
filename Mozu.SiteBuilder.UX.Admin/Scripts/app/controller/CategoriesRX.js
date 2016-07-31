/**
 * @class Taco.controller.CategoriesRx
 * The Categories React-Redux controller.
 */

Ext.define('Taco.controller.CategoriesRx', {
    extend: 'Taco.core.Controller',
    requires: ['Taco.view.categoriesRx.Index'],
    indexView: 'Taco.view.categoriesRx.Index',
    site: function () {
        Taco.core.StateManager.attemptNavigate('categoriesRx');
    }
});