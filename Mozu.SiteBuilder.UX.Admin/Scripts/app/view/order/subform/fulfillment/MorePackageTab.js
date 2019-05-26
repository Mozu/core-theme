/**
 * @class Taco.view.order.subform.fulfillment.Packages
 */
Ext.define('Taco.view.order.subform.fulfillment.MorePackageTab', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.modal.OverrideTotalWeight',
    ],

    initComponent: function () {
        this.tabTitle = this.packageRecord.code;

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
            this.shippingMethodsStore = this.record.getShippingMethods();

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

    handleShippingMethod: function (menu, item) {
        if (!item.methodCode) return;

        this.packageRecord.shippingMethodCode = item.methodCode;
        this.packageRecord.shippingMethodName = item.methodName;

        this.updateOrder({
            methodName: 'changeShippingMethod',
            errorMsg: 'Error changing shipping method on package',
            data: [this.packageRecord]
        });
    },

    handlePackagingType: function (menu, item) {
        this.packageRecord.packagingType = item.packagingType;

        this.updateOrder({
            methodName: 'changePackagingType',
            errorMsg: 'Error changing packaging type on package',
            data: [this.packageRecord]
        });
    },

    handleAddTrackingNumber: function () {
        Ext.create('Taco.view.order.modal.EditTrackingNumber', {
            packageData: this.packageRecord,
            record: this.record,
            autoShow: true
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
            cls: 'taco-order-fulfillment-info-header',
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
                    padding: '0 10 0 0',
                    defaults: {
                        xtype: 'component'
                    },
                    items: [
                        {
                            xtype: 'button',
                            ui: 'link',
                            scale: 'medium',
                            html: 'Method:',
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
                            hidden: !!this.packageRecord.shipmentId,
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
                            menu: {
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
                            html: this.packageRecord.shippingMethodName,
                            padding: '0 0 0 10',
                        }]
                },

                {
                    xtype: 'container',
                    padding: '0 10 0 0',
                    items: [{
                        xtype: 'component',
                        html: 'Tracking Number:',
                        cls: 'label',
                        padding: '5 0 0 0'
                    }, {
                        xtype: 'button',
                        ui: 'link',
                        scale: 'medium',
                        cls: 'button-link',
                        text: this.packageRecord.trackingNumber || '(Add)',
                        handler: this.handleAddTrackingNumber,
                        hidden: !!this.packageRecord.shipmentId,
                        scope: this,
                        requiredBehaviors: [{
                            model: 'Taco.model.Order',
                            behavior: 'update',
                            disable: this.packageRecord.trackingNumber ? true : false
                        },
                        {
                            model: 'Taco.model.Order',
                            behavior: 'fulfill'
                        }]
                    }, {
                        xtype: 'component',
                        html: this.packageRecord.trackingNumber || '(n/a)',
                        hidden: !this.packageRecord.shipmentId
                    }]
                },
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
                                    html: 'Packaging Type:',
                                    cls: 'label',
                                    hidden: !this.packageRecord.shipmentId
                                },
                                {
                                    xtype: 'button',
                                    ui: 'link',
                                    html: 'Packaging Type:',
                                    scale: 'medium',
                                    cls: 'label label-link',
                                    hidden: !!this.packageRecord.shipmentId,
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
                                    html: this.packageRecord.packagingType,
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
                            data: this.packageRecord
                        }, {
                            xtype: 'container',
                            layout: 'hbox',
                            items: [{
                                margin: '0 5 0 0',
                                xtype: 'component',
                                tpl: [
                                    '{weight} lbs'
                                ],
                                data: this.packageRecord
                            }, {
                                xtype: 'button',
                                text: '(Edit)',
                                ui: 'link',
                                hidden: !!this.packageRecord.shipmentId,
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
                            hidden: !!this.packageRecord.shipmentId,
                            //disabled: !this.packageRecord.hasLabel,
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
                            itemId: 'moveItem',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Move Item',

                            handler: function () {

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