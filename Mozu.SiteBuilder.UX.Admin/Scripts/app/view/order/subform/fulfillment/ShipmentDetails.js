Ext.define('Taco.view.order.subform.fulfillment.ShipmentDetails', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'taco-order-fulfillment-ShipmentDetails',
    requires: [
        'Taco.view.order.subform.fulfillment.ShipmentTabs'
    ],
    cls: 'taco-order-fulfillment-ShipmentDetails',

    collapsible: false,

    initComponent: function () {
        var me = this;
        this.items = [];
        this.shipmentTabs = Ext.create('Taco.view.order.subform.fulfillment.ShipmentTabs', {
            record: this.record,
            shipmentRecord: this.shipmentRecord,
            listeners: {
                shipmentRefresh: function () {
                    me.fireEvent('shipmentRefresh');
                },
                partialPickup: function (partialPickupItems) {
                    me.fireEvent('partialPickup', partialPickupItems);
                }
            }
        });
        this.items.push(this.shipmentTabs);

        this.callParent(arguments);
    }

});