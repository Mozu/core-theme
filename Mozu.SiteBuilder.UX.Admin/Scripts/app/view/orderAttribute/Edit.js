Ext.define('Taco.view.orderAttribute.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.orderAttribute.Form'
    ],
    enableSearchBar: false,
    formCls: 'Taco.view.orderAttribute.Form'
});