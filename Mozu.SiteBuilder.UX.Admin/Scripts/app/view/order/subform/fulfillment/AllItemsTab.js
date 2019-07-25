
Ext.define('Taco.view.order.subform.fulfillment.AllItemsTab', {
    extend: 'Taco.view.order.subform.Subform',

    tabTitle: 'All Items',
    isEditable: false,
    initComponent: function () {

        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);

        //this.needToReload = true;
        //this.mon(this.record, 'reload', function() {
        //    // Only bother reloading if the order has changed.
        //    this.needToReload = true;
        //}, this);
    },

    initUI: function () {
        var me = this;
        // itemId: this.packageRecord.code + 'shipment';
        isEditable = me.isEditable;
        this.shipmentItems = Ext.create('Taco.view.order.widget.ShippingPackagesGrid', {
            shipmentRecord: this.shipmentRecord,
            record: this.record,
            hidden: this.shipmentRecord.shipmentStatus == 'Cancelled',
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0',
            minHeight: '300',
        });
        

        this.items = [
            this.shipmentItems
        ];
    },

    onDestroy: function () {
        this.callParent(arguments);
    },

    doSave: function (shipmentRecord) {
        //debugger
    }

});