Ext.define('Taco.view.order.subform.FulfillmentNew', {
    extend: 'Taco.view.order.subform.Subform',

    alias: 'widget.taco-order-fulfillment',

    tabTitle: 'Fulfillment',

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
        var me = this;
        this.add(Ext.create('Taco.view.order.subform.fulfillment.ShipmentHeader', {
            record: this.record
        }));
        
        this.record.getLocations();
        this.record.locationsStore.load({
            scope: me,
            callback: function (records, operation, success) {
                me.record.set('locations', records);
                var shipments = me.record.get('shipments');
                if (shipments) {
                    for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
                        me.add(Ext.create('Taco.view.order.subform.fulfillment.Shipment', {
                            record: me.record,
                            shipmentRecord: shipments[shipmentCount]
                        }));
                    }
                }
            }
        });        
    }
});