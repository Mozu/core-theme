/**
 * @class Taco.view.customers.Edit
 */
Ext.define('Taco.view.customers.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: ['Taco.view.customers.Form'],
    formCls: 'Taco.view.customers.Form',
    title: "Edit Customer",
    initComponent: function () {
        this.callParent(arguments);
    }
});