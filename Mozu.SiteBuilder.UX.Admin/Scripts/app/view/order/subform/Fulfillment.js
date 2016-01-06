Ext.define('Taco.view.order.subform.Fulfillment', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.subform.fulfillment.Container'
    ],
    alias: 'widget.taco-order-fulfillment',

    tabTitle: 'Fulfillment',
    title: 'Fulfillment',

    initComponent: function () {

        this.cls = [this.cls, 'taco-order-fulfillment'].join(' ');

        this.record.on({
            reload: this.buildComponents,
            scope: this
        });

        this.callParent(arguments);

        this.buildComponents();
    },

    buildComponents: function () {

        this.setHeaderTitle('<div class="x-panel x-panel-header-text-container-subform"><span style="font-weight:normal;" class="x-panel-header-text">Fullfillment</span></div><span class="label" style="color:#999;">Status:</span><span style="font-weight:bold;"> ' + this.record.get('fulfillmentStatus') + '</span>');

        this.removeAll();

        if (this.record.get('packages').length || this.record.get('unShippedPackages').length || this.record.get('unpackagedItems').length) {
            this.add(Ext.create('Taco.view.order.subform.fulfillment.DirectShip', {
                record: this.record
            }));
        }

        if (this.record.get('pickups').length || this.record.get('pendingPickups').length || this.record.get('unpickedupItems').length) {
            this.add(Ext.create('Taco.view.order.subform.fulfillment.InStorePickup', {
                record: this.record
            }));
        }

        if (this.record.get('undeliveredDigitalItems').length || this.record.get('digitalPackages').length) {
            this.add(Ext.create('Taco.view.order.subform.fulfillment.DigitalDelivery', {
                record: this.record
            }));
        }
    }
});