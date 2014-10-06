/**
 * @class Taco.view.category.Edit
 */

Ext.define('Taco.view.category.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: 'widget.categoryfulledit',
    requires: ['Taco.view.category.Form'],
    formCls: 'Taco.view.category.Form',
    saveAndCreateButtonEnabled: true,
    doCreate: function () {
        var controller = "categories"
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    }
});
