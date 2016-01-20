Ext.define('Taco.view.orderAttribute.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.orderAttribute.Form'
    ],
    enableSearchBarInHeader: false,
    formCls: 'Taco.view.orderAttribute.Form',
    parentTitleCfg: {
        title: 'Order Attributes',
        controller: 'orderattributes'
    },
});