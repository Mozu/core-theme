/**
 * @class Taco.view.productType.Edit
 * @author Jimmy Sanford
 */

Ext.define('Taco.view.productType.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: ['Taco.view.productType.Form'],
    cls: 'producttypeheader', 
    formCls: 'Taco.view.productType.Form',
    enableSearchBarInHeader: false,
    saveAndCreateButtonEnabled: true,
    doCreate: function () {
        var controller = "producttypes"
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },
    parentTitleCfg: {
        title: 'Product Types',
        controller: 'producttypes'
    },
});