Ext.define('Taco.view.order.subform.Fulfillment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.subform.fulfillment.Container'
    ],
    alias: 'widget.taco-order-fulfillment',

    title: 'Fulfillment',

    initComponent: function() {

        this.title = 'Status: ' + this.record.get('fulfillmentStatus');

        this.items = [];


        if (this.record.get('packages').length || this.record.get('unpackagedItems').length) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DirectShip', {
                record: this.record
            }));
        }

        if (this.record.get('pickups').length || this.record.get('unpickedupItems').length) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.InStorePickup', {
                record: this.record
            }));
        }

        if (this.record.get('digitalPackages').length) {
            this.items.push(Ext.create('Taco.view.order.subform.fulfillment.DigitalDelivery', {
                record: this.record
            }));
        }

        this.callParent(arguments);
    }
});