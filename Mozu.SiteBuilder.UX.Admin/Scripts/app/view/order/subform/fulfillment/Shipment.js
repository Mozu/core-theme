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
        console.log(this.record);
        this.fulfillmentStatus = Taco.core.util.Common.camelToSpace(this.record.get('fulfillmentStatus'));

        this.items = [];

        this.buildShipmentInfoHeader();

        this.callParent(arguments);
    },

    buildShipmentInfoHeader: function () {

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
                [{
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Shipment</span><br/><br/>',
                        '#TBD'
                    ]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Status</span><br/><br/>',
                        ' <span class="x-column-content-pill x-column-content-pill-false">' + this.fulfillmentStatus + '</span>'
                    ]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Code</span><br/><br/>',
                        '1-400'
                    ]
                },
                {
                    padding: '0 50 0 0',
                    tpl: [
                        '<span class="label">Total</span><br/><br/>',
                        '$XXX.XX'
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
                            itemId: 'cancelShipment',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Cancel Shipment',
                            handler: function (evt) {
                                Ext.create('Taco.view.order.modal.fulfillment.ShipmentCancellation', {
                                    layout: 'hbox',
                                    width: 600,
                                    height: 400,
                                    //record: record,
                                    //parentRecord: me.record,
                                    //store: me.record.getCancellationReasons(),
                                    //originalQuantity: originalQuantity,
                                    //listeners: {
                                    //    saveSuccess: {
                                    //        fn: function (json) {
                                    //            //me.fireEvent('orderCancelled', json);
                                    //        },
                                    //        //scope: me
                                    //    }
                                    //}
                                });
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
                [{
                    padding: '0 20 0 0',
                    tpl: [
                        '<span class="label">Last Updated</span><br/>',
                        '05/02/2019 20:22:44 UTC'
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
                        'Dallas Warehouse <br/>',
                        '1100 N Royal Ln, Dallas, TX 75261 <br/>',
                        '123-456-7890 * email@name.com'
                    ]
                },
                {
                    flex: 1,
                    html: '',
                }]
        });

        this.items.push(this.infoContainerNew);

        //this.packageContainer = Ext.create('Taco.view.order.subform.fulfillment.Packages', {
        //    record: this.record
        //});        

        ////this.items.push(this.packageContainer);

        ////subtotals, orderlevel discounts, tax shipping, and totals
        //this.shipmentTotals = Ext.create('Taco.view.order.widget.ShipmentTotalPanel', {
        //    margin: '0 0 20 0',
        //    record: this.record
        //});
        //this.items.push(this.shipmentTotals);
        this.shipmentTotals = Ext.create('Taco.view.order.subform.fulfillment.ShipmentDetails', {
            record: this.record
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
        Ext.create('Taco.view.order.modal.EditTrackingNumber', {
            packageData: this.record,
            record: this.record,
            autoShow: true
        });
    },
});


