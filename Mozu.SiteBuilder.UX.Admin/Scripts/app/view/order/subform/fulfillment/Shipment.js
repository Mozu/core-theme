Ext.define('Taco.view.order.subform.fulfillment.Shipment', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'widget.taco-order-fulfillment-shipments',
    requires: [
        'Taco.view.order.subform.fulfillment.ShipmentDetails'

    ],
    packageContainer: {},

    initComponent: function () {
        this.items = [];

        this.buildShipmentInfoHeader();

        this.callParent(arguments);
    },

    buildShipmentInfoHeader: function () {
        var me = this;
        //if (this.shipmentRecord.shipmentStatus)
        //    this.shipmentStatus = Taco.core.util.Common.camelToSpace(this.shipmentRecord.shipmentStatus);
        //if (!this.record.shipmentId)
        this.shippingMethodsStore = this.record.getShippingMethods();

        this.infoContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-shipments',
            padding: '20 20 25 20',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items:
                [
                    {
                        padding: '0 50 0 0',
                        tpl: [
                            '<span class="label">Type</span>',
                            '<div class="labelvalue">Ship to Home</div>'
                        ]
                    },
                    {
                        padding: '0 50 0 0',
                        tpl: [
                            '<span class="label">Shipment</span>',
                            '<div class="labelvalue">' + this.shipmentRecord.number + '</div>'
                        ]
                    },
                    {
                        padding: '0 50 0 0',
                        tpl: [
                            '<span class="label">Last Updated</span>',
                            '<div class="labelvalue">05/02/19 20:22:44 UTC</div>'
                        ]
                    },
                    {
                        padding: '0 50 0 0',
                        tpl: [
                            '<span class="label">Status</span>',
                            '<div class="statusdiv x-column-content-pill x-column-content-pill-false">' + this.shipmentRecord.shipmentStatus + '</div>'
                        ]
                    },
                    {
                        padding: '0 50 0 0',
                        tpl: [
                            '<span class="label">Code</span>',
                            '<div class="labelvalue">1-400</div>'
                        ]
                    },
                    {
                        padding: '0 50 0 0',
                        tpl: [
                            '<span class="label">Total</span>',
                            '<div class="labelvalue">' + this.record.formatCurrency(this.shipmentRecord.cost) + '</div>'
                        ]
                    },
                    {
                        flex: 1,
                        html: '',
                    },
                    {
                        xtype: 'container',
                        padding: '0 20 0 0',
                        items: [
                            Ext.widget('splitbutton', {
                                menuAlign: 'tr-br?',
                                text: 'Reassign Shipment',
                                itemId: 'reassignShipmentSplitButton',
                                hidden: me.isShipmentAction(),
                                menu: [
                                    {
                                        text: 'Manual Reassign',
                                        handler: function () {
                                            me.record.getCandidateSuggestions({
                                                jsonData: "1",
                                                success: function (response) {
                                                    me.isRecordSaved = true;
                                                    me.setLoading(false, me.body);
                                                    var json = Ext.decode(response.responseText, true);


                                                    Ext.create('Taco.view.order.modal.fulfillment.ShipmentReassign', {
                                                        layout: 'hbox',
                                                        width: 1080,
                                                        height: 450,
                                                        record: me.record,
                                                        inventoryData: json,
                                                        listeners: {
                                                            saveSuccess: {
                                                                fn: function (json) {
                                                                    //me.fireEvent('orderCancelled', json);
                                                                },
                                                                //scope: me
                                                            }
                                                        }
                                                    });
                                                },
                                                failure: function (response) {
                                                    me.setLoading(false, me.body);
                                                    // close the dialog
                                                    me.close();
                                                }
                                            })
                                        }
                                    },
                                    {
                                        text: 'Auto Reassign',
                                        handler: function () { }
                                    }
                                ],

                                ui: 'action',
                                scale: 'medium',
                                margin: '0 2px 0 0'
                            })
                        ]
                    },
                    {
                        xtype: 'container',
                        padding: '0 0 0 0',
                        items: [
                            Ext.widget('splitbutton', {
                                menuAlign: 'tr-br?',
                                text: 'Update Shipment Status',
                                itemId: 'updateShipmentSplitButton',
                                handler: function () {

                                },
                                hidden: me.isShipmentAction(),
                                menu: me.getShipmentLevelSplitMenu(),
                                ui: 'action',
                                scale: 'medium',
                                margin: '0 2px 0 0'
                            })
                        ]
                    }
                ]
        });

        this.items.push(this.infoContainer);

        this.shipmentTotals = Ext.create('Taco.view.order.subform.fulfillment.ShipmentDetails', {
            record: this.record,
            shipmentRecord: this.shipmentRecord
        });
        this.items.push(this.shipmentTotals);
    },

    getShipmentLevelSplitMenu: function () {

        var actionCancelShipment = {
            text: 'Cancel Shipment',
            handler: function () { }
        };

        var actionMarkAsShipped = {
            text: 'Mark as shipped',
            handler: function () { }
        };
        var actionMoveToBackorder = {
            text: 'Move To backorder',
            handler: function () { }
        };

        var actionUpdateBackorderDate = {
            text: 'Update Backorder Date',
            handler: function () { }
        };

        var actionReleaseBackorder = {
            text: 'Release Backorder',
            handler: function () { }
        };

        if (this.shipmentRecord.shipmentStatus == 'Ready') {
            return [
                actionMarkAsShipped,
                actionMoveToBackorder,
                actionCancelShipment
            ];
        }
        else if (this.shipmentRecord.shipmentStatus == 'Backorder') {
            return [
                actionReleaseBackorder,
                actionUpdateBackorderDate,
                actionCancelShipment
            ];
        }
        else if (this.shipmentRecord.shipmentStatus == 'Customer Care') {
            return [
                actionMoveToBackorder,
                actionMarkAsShipped,
                actionCancelShipment
            ];
        }
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus == 'Fulfilled' || this.shipmentRecord.shipmentStatus == 'Cancelled')
            return true;
        return false;
    },

    openShipmentCancellationPopUp: function () {
        var me = this;
        var store = me.record.getCancellationReasons();
        store.load({
            scope: this,
            callback: function (records, operation, success) {
                if (records) {
                    for (var i = 0; i < records.length; i++) {
                        me.record.localeStore.each(function (localeRecord) {
                            if (records[i].get('reasonCode') == localeRecord.get('key')) {
                                records[i].dirty = true;
                                records[i].set('description', localeRecord.get('value'));
                                records[i].setDirty('description', localeRecord.get('value'));
                                records[i].commit();
                            }
                        });
                    }
                    Ext.create('Taco.view.order.modal.fulfillment.ShipmentCancellation', {
                        layout: 'hbox',
                        width: 600,
                        height: 400,
                        record: me.record,
                        shipmentRecord: me.shipmentRecord,
                        store: store,
                        listeners: {
                            saveSuccess: {
                                fn: function (json) {
                                    //me.fireEvent('orderCancelled', json);
                                },
                                //scope: me
                            }
                        }
                    });
                }
            }
        });
    }
});


