Ext.define('Taco.view.orderAttribute.Edit', {
    extend: 'Taco.view.react.Index',
    requires: [
        'Taco.view.orderAttribute.Form'
    ],
    enableSearchBarInHeader: false,
    formCls: 'Taco.view.orderAttribute.Form',
    parentTitleCfg: {
        title: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.order_attributes,
        controller: 'orderattributes'
    },
    initComponent: function () {
        this.callParent(arguments);
    }
});