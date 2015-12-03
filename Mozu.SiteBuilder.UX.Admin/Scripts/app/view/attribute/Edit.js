/**
 * @class  Taco.view.attribute.Edit
 * @author  Travis Johnson
 */

Ext.define('Taco.view.attribute.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: "widget.taco-attribute-edit",
    requires: [
        'Taco.view.attribute.Form'
    ],
    parentTitleCfg: {
        title: 'Attribute',
        controller: 'attribute'
    },
    enableSearchBar: false,
    formCls: 'Taco.view.attribute.Form',
    saveAndCreateButtonEnabled: true,
    doCreate: function () {
        var controller = "attributes"
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    }
});