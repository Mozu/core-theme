Ext.define('Taco.view.order.subform.fulfillment.ShipmentDetails', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'taco-order-fulfillment-ShipmentDetails',

    cls: 'taco-order-fulfillment-ShipmentDetails',

    collapsible: false,

    initComponent: function () {
        this.items = [];

        this.shipmentTabs = Ext.create('Taco.view.order.subform.fulfillment.ShipmentTabs', {
            record: this.record,
            shipmentRecord: this.shipmentRecord
        });
        this.items.push(this.shipmentTabs);

        this.callParent(arguments);
    }

});