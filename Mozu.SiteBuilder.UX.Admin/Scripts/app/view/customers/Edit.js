/**
 * @class Taco.view.customers.Edit
 */
Ext.define('Taco.view.customers.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: ['Taco.view.customers.Form'],
    formCls: 'Taco.view.customers.Form',

    initComponent: function () {
        this.callParent(arguments);
    }
});