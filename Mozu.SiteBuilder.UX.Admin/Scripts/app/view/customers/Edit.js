/**
 * @class Taco.view.customers.Edit
 */
Ext.define('Taco.view.customers.Edit', {
    extend: 'Taco.view.react.Index',
    formCls: 'Taco.view.customers.Form',
    title: "Edit Customer",
    enableSearchBarInHeader: false,
    parentTitleCfg: {
        title: 'Customer',
        controller: 'customers'
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});