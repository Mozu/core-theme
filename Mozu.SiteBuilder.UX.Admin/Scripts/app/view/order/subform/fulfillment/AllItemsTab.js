
Ext.define('Taco.view.order.subform.fulfillment.AllItemsTab', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.widget.ShippingPackagesGrid'
    ],

    //tabTitle: 'All Items',
    initComponent: function () {

        this.tabTitle = this.shipmentRecord.items ? Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.items +' '+ "(" + this.shipmentRecord.items.length + ")" : Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Title.items+' '+"(0)";
        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);
    },

    initUI: function () {
        var me = this;
        // itemId: this.packageRecord.code + 'shipment';
        this.shipmentItems = Ext.create('Taco.view.order.widget.ShippingPackagesGrid', {
            shipmentRecord: this.shipmentRecord,
            record: this.record,
            hidden: this.shipmentRecord.shipmentStatus.toLowerCase() == 'canceled',
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0',
            minHeight: me.calculateHeight(),
            listeners: {
                shipmentReassign: function () {
                    me.fireEvent('shipmentRefresh');
                },
                shipmentRefresh: function () {
                    me.fireEvent('shipmentRefresh');
                },
                partialPickup: function (partialPickupItems) {
                    me.fireEvent('partialPickup', partialPickupItems);
                },
                celldblclick: function (grid, td, cellIndex, record, tr, rowIndex, e) {
                    return this.shipmentRecord.shipmentType.toLowerCase() != 'bopis'
                },
                viewready: function (view) {
                    var els = view.el.query('div[qty-to-pickup]');
                    Ext.each(els, function (domEl) {
                        var qtyToPickup = parseInt(Ext.get(domEl).getAttribute('qty-to-pickup'));
                        var lineId = Ext.get(domEl).getAttribute('lineId');
                        var extId = Ext.id();
                        Ext.widget({
                            xtype: 'container',
                            cls: 'taco-order-fulfillment-shipments-pickup',
                            height: 50,
                            renderTo: domEl,
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
                                        xtype: 'checkbox',
                                        lineId: lineId,
                                        qtyToPickup: qtyToPickup,
                                        disabled: qtyToPickup <= 0,
                                        checked: false,
                                        listeners: {
                                            change: function (cmp, newValue,a,b) {
                                                if (newValue) {
                                                    Ext.getCmp(extId).enable();
                                                    me.shipmentItems.savePartialPickup(this.lineId, parseInt(Ext.getCmp(extId).value), true);
                                                }
                                                else {
                                                    Ext.getCmp(extId).disable();
                                                    me.shipmentItems.savePartialPickup(this.lineId, 0, true);
                                                }
                                            }
                                        },
                                    },
                                    {
                                        xtype: 'numberfield',
                                        id: extId,
                                        lineId: lineId,
                                        minValue: 1,
                                        maxValue: qtyToPickup,
                                        maxText: Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.max_qty_available + '{0}',
                                        value: qtyToPickup,
                                        disabled: true,
                                        hidden: qtyToPickup <= 0,
                                        //hideTrigger: true,
                                        //keyNavEnabled: false,
                                        //mouseWheelEnabled: false,
                                        //enableKeyEvents:true,
                                        listeners: {
                                            blur: {
                                                fn: function (cmp, newValue) {
                                                    me.shipmentItems.savePartialPickup(this.lineId, cmp.value, cmp.wasValid);
                                                }
                                            }
                                        }
                                    }
                                ]
                        });
                    }, this);
                    view.up('viewport').doLayout();
                },
            }
        });

        this.shipmentLabelContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-body',
            padding: '0 0 10 0',
            hidden: this.shipmentRecord.shipmentStatus.toLowerCase() != 'canceled',
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                xtype: 'component',
            },
            items: [
                {
                    margin: {
                        left: 500,
                        top: 50,
                    },
                    flex: 1,
                    html: '<h3 class="">' + Localizer.langResources.ORDERS.Orders.OrderEdit.Shipments.Message.shipment_is_canceled+'</h3>',
                },
                {
                    flex: 1,
                    html: '',
                }
            ]
        });

        this.items = [
            this.shipmentLabelContainer,
            this.shipmentItems
        ];
    },

    calculateHeight: function () {
        return this.shipmentRecord.items ? (100 + (55 * this.shipmentRecord.items.length)) : 60;
    },

    onDestroy: function () {
        this.callParent(arguments);
    },

    doSave: function (shipmentRecord) {
    }

});