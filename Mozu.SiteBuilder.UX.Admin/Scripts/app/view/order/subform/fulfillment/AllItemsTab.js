/**
 * @class Taco.view.order.subform.fulfillment.Packages
 */
Ext.define('Taco.view.order.subform.fulfillment.AllItemsTab', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.modal.OverrideTotalWeight',
    ],

    initComponent: function () {
        //this.tabTitle = this.packageRecord.code;
        //this.title = this.packageRecord.code;

        this.cls += " " + Taco.baseCSSPrefix + 'orderform-package';
        this.initUI();
        this.callParent(arguments);

        //this.needToReload = true;
        //this.mon(this.record, 'reload', function() {
        //    // Only bother reloading if the order has changed.
        //    this.needToReload = true;
        //}, this);
    },

    //destroyUI: function() {
    //    this.removeAll();
    //    this.createButton = this.packageItemsErrorEl = this.packageItems = null;
    //},

    initUI: function () {

        itemId: this.packageRecord.code + 'shipment';

        if (!this.packageRecord.shipmentId) {
            this.packagingTypeStore = Ext.create('Taco.store.PackagingTypes');
            this.packagingTypeStore.load();
        }

        this.packageItems = Ext.create('Taco.view.order.widget.ShippingPackagesGrid', {
            packageStore: this.packageRecord,
            record: this.record,
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0'
        });

        this.items = [
            this.buildTrackingHeader(),
            this.packageItems
        ];
    },

    addTracking: function () {
        alert('Add Tracking click');
    },    

    buildPackagingTypes: function () {
        var ret = [];

        this.packagingTypeStore.each(function (type) {
            ret.push({
                text: type.get('text'),
                packagingType: type.get('packagingType')
            });
        });

        return ret;
    },    

    handlePackagingType: function (menu, item) {
        this.packageRecord.packagingType = item.packagingType;

        this.updateOrder({
            methodName: 'changePackagingType',
            errorMsg: 'Error changing packaging type on package',
            data: [this.packageRecord]
        });
    },    

    handleOverrideWeight: function () {
        Ext.create('Taco.view.order.modal.OverrideTotalWeight', {
            record: this.packageRecord,
            listeners: {
                scope: this,
                aftersaveclose: function (dialog, data) {
                    this.packageRecord.weight = data.weight;

                    this.updateOrder({
                        methodName: 'changePackageWeight',
                        errorMsg: 'Error changing package weight',
                        data: [this.packageRecord]
                    });
                }
            }
        });
    },

    handlePrintPackingSlip: function () {
        var siteId = this.record.get('siteId'),
            orderId = this.record.getId(),
            packageId = this.packageRecord.id;
        window.open('/admin/s-' + siteId + '/orderdetails/' + orderId + '/packages/' + packageId);
    },

    handleViewShippingLabel: function () {
        window.open(
            '/admin/app/order/shipping/package/label?orderId=' + this.record.getId() + '&packageId=' + this.packageRecord.id,
            'mozu-shippingLabel-' + this.record.getId() + '-' + this.packageRecord.id
        );
    },  
    
    buildTrackingHeader: function () {
        return Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-header',
            padding: '0 0 10 0',
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                xtype: 'component',
                data: this.record.getData()
            },
            items: [
                {
                    xtype: 'container',
                    defaults: {
                        xtype: 'component'
                    },
                    items: [
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
                                    html: 'Packaging Type:',
                                    scale: 'medium',
                                    cls: 'label label-link',
                                    hidden: !!this.record.shipmentId,
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
                                            menu.removeAll();
                                            menu.add(this.buildPackagingTypes());
                                        },
                                        scope: this
                                    },
                                    menu: {
                                        plain: true,
                                        listeners: {
                                            click: this.handlePackagingType,
                                            scope: this,
                                            delegate: 'x-menu-item-link'
                                        },
                                        items: [{
                                            text: ''
                                        }]
                                    }
                                }, {
                                    html: this.record.packagingType,
                                    padding: '0 0 0 10',
                                }]
                        }
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
                            margin: '5 0 0 0',
                            tpl: [
                                '<span class="label">Total Weight:</span>'
                            ],
                            data: this.record
                        }, {
                            xtype: 'container',
                            layout: 'hbox',
                            items: [{
                                margin: '0 5 0 0',
                                xtype: 'component',
                                tpl: [
                                    '{weight} lbs'
                                ],
                                data: this.record
                            }, {
                                xtype: 'button',
                                text: '(Edit)',
                                ui: 'link',
                                hidden: !!this.record.shipmentId,
                                handler: this.handleOverrideWeight,
                                scope: this,
                                requiredBehaviors: [{
                                    model: 'Taco.model.Order',
                                    behavior: 'update'
                                },
                                {
                                    model: 'Taco.model.Order',
                                    behavior: 'fulfill'
                                }]
                            }]
                        }]
                },
                {
                    flex: 1,
                    html: '',
                },
                {
                    xtype: 'container',
                    padding: '8 0 0 0',
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
                            }],
                            margin: '0 15 0 0'
                        }),
                        Ext.widget('button', {
                            itemId: 'shippingLabels',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Get Shipping Labels',
                            margin: '0 15 0 0',
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
                        Ext.widget('button', {
                            itemId: 'editItems',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Edit Items',
                            margin: '0 15 0 0',
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
                        Ext.widget('button', {
                            itemId: 'reassignItems',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Reassign Items',
                            margin: '0 15 0 0',
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
                        Ext.widget('button', {
                            itemId: 'cancelItem',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Cancel Item',

                            handler: function () {
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
                        })
                    ]
                }
            ]
        });
    },
    onDestroy: function () {
        this.callParent(arguments);
    }
});