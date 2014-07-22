Ext.define('Taco.view.order.subform.Fulfillment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.subform.fulfillment.Container'
    ],
    alias: 'widget.taco-order-fulfillment',

    tabTitle: 'Fulfillment',

    initComponent: function() {

        this.record.on({
            reload: this.buildComponents,
            scope: this
        });
       
        this.callParent(arguments);

        this.buildComponents();
    },

    buildComponents: function() {
        
        this.removeAll();

        if (this.record.get('packages').length || this.record.get('unpackagedItems').length) {
            this.add(Ext.create('Taco.view.order.subform.fulfillment.DirectShip', {
                record: this.record
            }));
        }

        if (this.record.get('pickups').length || this.record.get('unpickedupItems').length) {
            this.add(Ext.create('Taco.view.order.subform.fulfillment.InStorePickup', {
                record: this.record
            }));
        }

        if (this.record.get('digitalPackages').length) {
            this.add(Ext.create('Taco.view.order.subform.fulfillment.DigitalDelivery', {
                record: this.record
            }));
        }

        this.title = 'Status: ' + this.record.get('fulfillmentStatus');
    }
});