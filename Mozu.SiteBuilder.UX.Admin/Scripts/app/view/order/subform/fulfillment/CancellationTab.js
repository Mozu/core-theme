
Ext.define('Taco.view.order.subform.fulfillment.CancellationTab', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.ShippingCancellationGrid'
    ],

    
    //title: 'Cancelled Items (3)',

    initComponent: function () {

        this.cls = 'shipping-packages-grid';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;
        this.tabTitle = Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.canceled_items+' ' + ((this.shipmentRecord.canceledItems && this.shipmentRecord.canceledItems.length > 0) ? '(' + this.shipmentRecord.canceledItems.length + ')' : '');
        
        this.shippingCancellationGrid = Ext.create('Taco.view.order.widget.ShippingCancellationGrid', {
            shipmentRecord: this.shipmentRecord,
            record: this.record,
            minHeight:300,
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0',
            minHeight: me.calculateHeight()
        });

        this.items = [
            this.shippingCancellationGrid
        ];
    },

    calculateHeight: function () {
        return this.shipmentRecord.items ? (50 + (50 * this.shipmentRecord.items.length)) : 50;
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});