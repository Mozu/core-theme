
Ext.define('Taco.view.order.subform.fulfillment.CancellationTab', {
    extend: 'Taco.view.order.subform.Subform',

    tabTitle: 'Cancelled Items (5)',
    //title: 'Cancelled Items (3)',

    initComponent: function () {

        this.cls += ' shipmentform-cancellationtab';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;
        this.shippingCancellationGrid = Ext.create('Taco.view.order.widget.ShippingCancellationGrid', {
            packageStore: this.packageRecord,
            record: this.record,
            minHeight:300,
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0'
        });

        this.items = [
            this.shippingCancellationGrid
        ];
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});