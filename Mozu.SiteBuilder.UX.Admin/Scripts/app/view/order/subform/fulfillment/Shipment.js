Ext.define('Taco.view.order.subform.fulfillment.Shipment', {
    extend: 'Taco.view.order.subform.fulfillment.Container',
    alias: 'widget.taco-order-fulfillment-shipments',
    requires: [
        //'Taco.view.order.subform.fulfillment.Container',
        'Taco.view.order.subform.fulfillment.Packages',
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
                            '<span class="label">Shipment</span>',
                            '<div class="labelvalue">' + this.shipmentRecord.number + '</div>'
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
                            '<div class="labelvalue">$XXX.XX</div>'
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
                            Ext.widget('button', {
                                itemId: 'shippingLabels',
                                ui: 'action',
                                scale: 'medium',
                                text: 'Get Shipping Labels',
                                //hidden: !!this.record.shipmentId,
                                //disabled: !this.record.hasLabel,
                                requiredBehaviors: [{
                                    model: 'Taco.model.Order',
                                    behavior: 'update'
                                },
                                {
                                    model: 'Taco.model.Order',
                                    behavior: 'fulfill'
                                }],
                                handler: this.handleViewShippingLabel
                            }),
                        ]
                    },
                    {
                        xtype: 'container',
                        padding: '0 20 0 0',
                        items: [
                            Ext.widget('button', {
                                itemId: 'printPacking',
                                ui: 'action',
                                scale: 'medium',
                                text: 'Print Packing Slip',
                                handler: this.handlePrintPackingSlip,
                                requiredBehaviors: [{
                                    model: 'Taco.model.Order',
                                    behavior: 'update'
                                },
                                {
                                    model: 'Taco.model.Order',
                                    behavior: 'fulfill'
                                }]
                            }),
                        ]
                    },
                    {
                        xtype: 'container',
                        padding: '0 20 0 0',
                        items: [
                            Ext.widget('button', {
                                itemId: 'cancelShipment',
                                ui: 'action',
                                scale: 'medium',
                                text: 'Cancel Shipment',
                                handler: function (evt) {
                                    me.openShipmentCancellationPopUp();
                                }
                            }),

                        ]
                    },
                    {
                        xtype: 'container',
                        items: [
                            Ext.widget('button', {
                                itemId: 'reassignShipment',
                                ui: 'action',
                                scale: 'medium',
                                text: 'Reassign Shipment',
                                handler: function (evt) {
                                    Ext.create('Taco.view.order.modal.fulfillment.OrderCancellation', {
                                        layout: 'hbox',
                                        width: 600,
                                        height: 400,
                                        //record: record,
                                        //parentRecord: me.record,
                                        //store: me.record.getCancellationReasons(),
                                        //originalQuantity: originalQuantity,
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
                            }),

                        ]
                    }
                ]
        });

        this.items.push(this.infoContainer);

        this.infoContainerNew = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-header',
            padding: '0 20 25 20',
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
                        padding: '0 20 0 0',
                        tpl: [
                            '<span class="label">Last Updated</span>',
                            '<div class="customfont">' + (this.shipmentRecord.auditInfo && this.shipmentRecord.auditInfo.updateDate ? this.shipmentRecord.auditInfo.updateDate : '') +'</div>'
                        ]
                    },
                {
                    xtype: 'container',
                    padding: '0 10 0 0',
                    defaults: {
                        xtype: 'component'
                    },
                    items: [
                        {
                            xtype: 'button',
                            ui: 'link',
                            scale: 'medium',
                            html: 'Shipping Method',
                            cls: 'label label-link',
                            requiredBehaviors: [{
                                model: 'Taco.model.Order',
                                behavior: 'update',
                                disable: true
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'fulfill'
                            }],
                            listeners: {
                                menushow: function (button, menu) {
                                    // Removed if check, this should always fire!
                                    this.shippingMethodsStore.load({
                                        scope: this,
                                        callback: function () {
                                            menu.removeAll();
                                            menu.add(this.buildShippingMethods());
                                        }
                                    });
                                },
                                scope: this
                            },
                            menu:
                            {
                                plain: true,
                                baseCls: 'taco-shipping-menu',

                                listeners: {
                                    click: this.handleShippingMethod,
                                    scope: this,
                                    delegate: 'x-menu-item-link'
                                },
                                items: [{
                                    text: 'loading..'
                                }]
                            }
                        },
                        {
                            html: this.record.get('shippingMethodName'),
                            padding: '0 0 0 10',
                        }]
                },
                {
                    xtype: 'container',
                    padding: '0 10 0 0',
                    items: [{
                        xtype: 'component',
                        html: 'Tracking Number',
                        cls: 'label',
                        padding: '5 0 0 0'
                    }, {
                        xtype: 'button',
                        ui: 'link',
                        scale: 'medium',
                        cls: 'button-link',
                        text: this.record.trackingNumber || '(Add)',
                        handler: this.handleAddTrackingNumber,
                        //hidden: !!this.record.shipmentId,
                        scope: this,
                        requiredBehaviors: [{
                            model: 'Taco.model.Order',
                            behavior: 'update',
                            disable: this.record.trackingNumber ? true : false
                        },
                        {
                            model: 'Taco.model.Order',
                            behavior: 'fulfill'
                        }]
                    }, {
                        xtype: 'component',
                        html: this.record.trackingNumber || '(n/a)',
                        hidden: !this.record.shipmentId
                    }]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Fulfilled From</span><br/>',
                        this.getFullfillmentFromAddress()
                    ]
                },
                {
                    flex: 1,
                    html: '',
                }]
        });

                    ]
                },
                {
                    xtype: 'container',
                    items: [
                        Ext.widget('button', {
                            itemId: 'reassignShipment',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Reassign Shipment',
                            handler: function (evt) {
                                Ext.create('Taco.view.order.modal.fulfillment.ShipmentReassign', {
                                    layout: 'hbox',
                                    width: 1080,
                                    height: 700,
                                    //record: record,
                                    //parentRecord: me.record,
                                    //store: me.record.getCancellationReasons(),
                                    //originalQuantity: originalQuantity,
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
                        }),

        this.shipmentTotals = Ext.create('Taco.view.order.subform.fulfillment.ShipmentDetails', {
            record: this.record,
            shipmentRecord: this.shipmentRecord
        });
        this.items.push(this.shipmentTotals);
    },

    buildShippingMethods: function () {
        var ret = [];

        this.shippingMethodsStore.each(function (method) {
            ret.push({
                text: method.get('shippingMethodName'),
                methodName: method.get('shippingMethodName'),
                methodCode: method.get('shippingMethodCode')
            });
        });

        return ret;
    },

    handleShippingMethod: function (menu, item) {
        if (!item.methodCode) return;

        this.record.set('shippingMethodCode') = item.methodCode;
        this.record.set('shippingMethodName') = item.methodName;

        this.updateOrder({
            methodName: 'changeShippingMethod',
            errorMsg: 'Error changing shipping method on package',
            data: [this.record]
        });
    },

    handleAddTrackingNumber: function () {
        Ext.create('Taco.view.order.modal.EditTrackingNumberNew', {
            packageData: this.record,
            record: this.record,
            autoShow: true
        });
    },

    getFullfillmentFromAddress: function () {
        var address = "";
        var originAddress = this.shipmentRecord.originAddress;
        if (originAddress)
            //return originAddress.firstName + ' ' + originAddress.lastName + ' <br/>' +
            //    originAddress.address1 + ', ' + originAddress.cityOrTown + ', ' + originAddress.stateOrProvince + ' ' + originAddress.postalOrZipCode + '<br/>' +
            //    originAddress.mobilePhone + ' * ' + originAddress.email;

            return '<div class="addressdiv">' + originAddress.firstName + ' ' + originAddress.lastName + ' <br/>' +
                originAddress.address1 + ', ' + originAddress.cityOrTown + ', ' + originAddress.stateOrProvince + ' ' + originAddress.postalOrZipCode + '<br/>' +
                originAddress.mobilePhone + ' * ' + originAddress.email + '</div>';

        return address;
    },

    handleViewShippingLabel: function () {
        //window.open(
        //    '/admin/app/order/shipping/package/label?orderId=' + this.record.getId() + '&packageId=' + this.packageRecord.id,
        //    'mozu-shippingLabel-' + this.record.getId() + '-' + this.packageRecord.id
        //);
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


