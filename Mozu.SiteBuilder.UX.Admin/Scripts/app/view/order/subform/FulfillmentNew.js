Ext.define('Taco.view.order.subform.FulfillmentNew', {
    extend: 'Taco.view.order.subform.Subform',

    alias: 'widget.taco-order-fulfillment',

    tabTitle: 'Shipments',

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
        //Remove all shipments before refreshing
        me.removeAll();

        me.setLoading(true, this.body);
        this.record.getLocations();

        this.add(Ext.create('Taco.view.order.subform.fulfillment.ShipmentHeader', {
            record: this.record,
            listeners: {
                shipmentRefresh: function () {
                    me.shipmentRefresh();
                }
            }
        }));

        var shipments = this.getShipments();
        if (shipments) {
            for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
                if (shipments[shipmentCount].locationCode) {
                    this.record.getLocationsByCode(shipments[shipmentCount].locationCode).load({
                        scope: this,
                        params: { 'shipmentCount': shipmentCount },
                        callback: function (records, operation, success) {
                            if (records && records[0] && records[0].data) {
                                shipments[operation.params.shipmentCount].location = records[0].data;
                            }

                            me.add(Ext.create('Taco.view.order.subform.fulfillment.Shipment', {
                                record: me.record,
                                shipmentRecord: shipments[operation.params.shipmentCount],
                                listeners: {
                                    shipmentRefresh: function () {
                                        me.shipmentRefresh();
                                    }
                                }
                            }));
                            me.setLoading(false, this.body);
                        }
                    });
                }
                else
                    me.add(Ext.create('Taco.view.order.subform.fulfillment.Shipment', {
                        record: me.record,
                        shipmentRecord: shipments[shipmentCount],
                        listeners: {
                            shipmentRefresh: function () {
                                me.shipmentRefresh();
                            }
                        }
                    }));
            }
            me.setLoading(false, this.body);
        }
    },
    getShipments: function () {
        var shipments = this.record.get('shipments');
        var filteredShipments = [];
        if (shipments) {
            for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
                if (shipments[shipmentCount].shipmentStatus.toLowerCase() != 'reassigned')
                    filteredShipments.push(shipments[shipmentCount]);
            }
        }
        return filteredShipments;
    },
    shipmentRefresh: function () {
        var me = this;
        me.removeAll();
        me.setLoading(true, this.body);
        this.record.reload();
        me.setLoading(false, this.body);
    }
});