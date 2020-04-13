Ext.define('Taco.view.order.subform.FulfillmentNew', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.model.SiteShipSetting',
        'Taco.view.order.subform.fulfillment.ShipmentHeader',
        'Taco.view.order.subform.fulfillment.Shipment'
    ],
    alias: 'widget.taco-order-fulfillment',

    tabTitle: 'Shipments',

    initComponent: function () {
        var me = this;
        this.cls = [this.cls, 'taco-order-fulfillment'].join(' ');

        //Load Cancellation Reasons for category CSR. This needs to display reason code's description.
        var store = me.record.getCancellationReasons("CSR");
        store.load({
            scope: this,
            callback: function (records, operation, success) {
                if (records) {
                    me.record.set('csrCancellationReasons', records);
                }
            }
        });
        
        this.record.on({
            reload: this.buildComponents,
            scope: this
        });

        this.callParent(arguments);

      
        Taco.model.SiteShipSetting.load(123, {
            scope: this,
            failure: function () {
                // there should be a message here
            },
            success: function (record) {

            },
            callback: function (record) {
                me.record.SiteShipSetting = record;
                me.siteShipSettingLoaded = true;
                if (me.isRender())
                    me.buildComponents();
            }
        });

        this.record.getSTSSettigs().load({
            scope: this,
            failure: function () {
                // there should be a message here
            },
            success: function (record) {

            },
            callback: function (record) {
                if (record && record.length>0) {
                    me.record.STSSettings = record[0].data;                    
                }
                me.stsSettingLoaded = true;
                if (me.isRender())
                    me.buildComponents();
            }
        });
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

        me.setLoading(true, this.body);
        me.getLocationInforForShipment();
        me.setLoading(false, this.body);
    },

    getLocationInforForShipment: function () {
        var me = this;
        var shipments = me.record.get('shipments');
        var filters = [];
        filters.push({
            property: 'any',
            text: 'ANY',
            isDefault: true
        });

        if (shipments) {
            //create a filter for location service
            for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
                if (shipments[shipmentCount].fulfillmentLocationCode) {
                    filters.push(
                        {
                            property: 'code',
                            value: shipments[shipmentCount].fulfillmentLocationCode
                        }
                    );
                }
            }

            if (filters.length > 1) {
                this.record.getLocationsByFilter(filters).load({
                    scope: this,
                    callback: function (records, operation, success) {
                        if (records && records.length > 0) {
                            //shipments[operation.params.shipmentCount].location = records[0].data;
                            for (var locCount = 0; locCount < records.length; locCount++) {
                                for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
                                    //patch location on shipment object
                                    if (!shipments[shipmentCount].location && records[locCount].data && records[locCount].get('code') == shipments[shipmentCount].fulfillmentLocationCode) {
                                        shipments[shipmentCount].location = records[locCount].data;
                                    }
                                }
                            }
                        }
                        me.renderShipments(shipments);
                        me.setLoading(false, this.body);
                    }
                });
            }
            else {
                me.renderShipments(shipments);
            }
            me.setLoading(false, this.body);
        }
    },

    renderShipments: function (shipments) {
        var me = this;
        for (var shipmentCount = 0; shipmentCount < shipments.length; shipmentCount++) {
            var shipmentCard = Ext.create('Taco.view.order.subform.fulfillment.Shipment', {
                record: me.record,
                shipmentRecord: shipments[shipmentCount],
                listeners: {
                    shipmentRefresh: function () {
                        me.shipmentRefresh();
                    }
                }
            });
            me.add(shipmentCard);
            this.setShipmentCardId(shipments[shipmentCount].number, shipmentCard.getId());
        }
    },

    setShipmentCardId: function (shipmentNumber, extId) {
        for (var count = 0; count < this.record.data.shipments.length; count++) {
            if (this.record.data.shipments[count].number == shipmentNumber)
                this.record.data.shipments[count].shipmentCardId = extId;
        }
    },

    shipmentRefresh: function () {
        var me = this;
        me.removeAll();
        me.setLoading(true, this.body);
        this.record.reload();
        me.setLoading(false, this.body);
    },

    isRender: function () {
        var me = this;
        return me.stsSettingLoaded && me.siteShipSettingLoaded;
    }
});