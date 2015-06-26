Ext.define('Taco.view.order.subform.fulfillment.DirectShipPackage', {
    extend: 'Taco.view.order.subform.fulfillment.Package',

    requires: [
        'Taco.view.order.subform.fulfillment.Grid',
        'Taco.view.order.modal.OverrideTotalWeight',
        'Taco.core.ux.form.ResendEmailButton'
    ],

    initComponent: function () {

        this.title = 'Package: ' + this.packageData.code;

        this.details = Ext.widget({
            xtype: 'component',
            html: 'header'
        });

        this.grid = Ext.create('Taco.view.order.subform.fulfillment.Grid', {
            record: this.record,
            packageData: this.packageData,
            unfulfilledFieldName: 'unShippedPackages'
        });

        if (!this.packageData.contact) {
            this.packageData.contact = this.record.get('fulfillmentContact');
        }

        if (!this.packageData.shipmentId) {
            this.shippingMethodsStore = this.record.getShippingMethods();

            this.packagingTypeStore = Ext.create('Taco.store.PackagingTypes');

            this.packagingTypeStore.load();
        }

        this.details = Ext.widget({
            xtype: 'container',
            layout: {
                type: 'hbox',
                align: 'left'
            },
            defaults: {
                xtype: 'component'
            },
            items: [{
                padding: '0 10 0 0',
                tpl: [
                    '<span class="label">Ship To:</span><br>',
                    '{firstName:stripTags}<tpl if="middleName"> {middleName:stripTags}</tpl> {lastName:stripTags}<br>',
                    '{address1:stripTags}<br>',
                    '<tpl if="address2">{address2:stripTags}<br></tpl>',
                    '<tpl if="address3">{address3:stripTags}<br></tpl>',
                    '<tpl if="address4">{address4:stripTags}<br></tpl>',
                    '{cityOrTown:stripTags}, {stateOrProvince:stripTags} {postalOrZipCode:stripTags} {countryCode:stripTags}',
                    '<tpl if="homePhone"><br>{homePhone:stripTags}</tpl>',
                    '<tpl if="mobilePhone"><br>{mobilePhone:stripTags}</tpl>',
                    '<tpl if="workPhone"><br>{workPhone:stripTags}</tpl>'
                ],
                data: this.packageData.contact
            }, {
                xtype: 'container',
                padding: '0 10 0 0',
                defaults: {
                    xtype: 'component'
                },
                items: [{
                    html: 'Shipping Method:',
                    cls: 'label',
                    hidden: !this.packageData.shipmentId
                }, {
                    xtype: 'button',
                    ui: 'link',
                    scale: 'medium',
                    html: 'Shipping Method:',
                    cls: 'label label-link',
                    hidden: !!this.packageData.shipmentId,
                    listeners: {
                        menushow: function (button, menu) {
                            // Removed if check, this should always fire!
                            this.shippingMethodsStore.load({
                                scope: this,
                                callback: function() {
                                    menu.removeAll();
                                    menu.add(this.buildShippingMethods());
                                }
                            });
                        },
                        scope: this
                    },
                    menu: {
                        plain: true,
                        listeners: {
                            click: this.handleShippingMethod,
                            scope: this,
                            delegate: 'x-menu-item-link'
                        },
                        items: [{
                            text: 'loading..'
                        }]
                    }
                }, {
                    html: this.packageData.shippingMethodName
                }, {
                    margin: '8 0 0 0',
                    tpl: [
                        '<span class="label">Total Weight:</span>'
                    ],
                    data: this.packageData
                }, {
                    xtype: 'container',
                    layout: 'hbox',
                    items: [{
                        margin: '0 5 0 0',
                        xtype: 'component',
                        tpl: [
                            '{weight} lbs'
                        ],
                        data: this.packageData
                    }, {
                        xtype: 'button',
                        text: '(Edit)',
                        ui: 'link',
                        hidden: !!this.packageData.shipmentId,
                        handler: this.handleOverrideWeight,
                        scope: this
                    }]
                }]
            }, {
                xtype: 'container',
                padding: '0 10 0 0',
                defaults: {
                    xtype: 'component'
                },
                items: [{
                    html: 'Packaging Type:',
                    cls: 'label',
                    hidden: !this.packageData.shipmentId
                }, {
                    xtype: 'button',
                    ui: 'link',
                    html: 'Packaging Type:',
                    scale: 'medium',
                    cls: 'label label-link',
                    hidden: !!this.packageData.shipmentId,
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
                    html: this.packageData.packagingType
                }]
            }, {
                xtype: 'container',
                padding: '0 10 0 0',
                items: [{
                    xtype: 'component',
                    html: 'Tracking Number:',
                    cls: 'label'
                }, {
                    xtype: 'button',
                    ui: 'link',
                    scale: 'medium',
                    cls: 'button-link',
                    text: this.packageData.trackingNumber || '(Add)',
                    handler: this.handleAddTrackingNumber,
                    hidden: !!this.packageData.shipmentId,
                    scope: this
                }, {
                    xtype: 'component',
                    html: this.packageData.trackingNumber || '(n/a)',
                    hidden: !this.packageData.shipmentId
                }]
            }]
        });

        this.actions = [{
            text: 'Print Packing Slip',
            handler: this.handlePrintPackingSlip
        }, {
            text: 'View Shipping Label',
            hidden: !this.packageData.shipmentId,
            disabled: !this.packageData.hasLabel,
            handler: this.handleViewShippingLabel
        }, {
            text: 'Get Shipping Label',
            hidden: !!this.packageData.shipmentId,
            handler: this.handleGetShippingLabel
        }, {
            text: 'Cancel',
            hidden: this.packageData.status === 'Fulfilled',
            handler: this.handleCancel
        }, {
            text: 'Mark as Shipped',
            hidden: this.packageData.status === 'Fulfilled',
            handler: this.handleMarkAsShipped
        }, {
            xtype: 'resendemailbutton',
            margin: '0 0 0 10',            
            emailUrl: '/admin/app/order/shipping/package/resendshipmentemail',
            jsonData: {
                orderId: this.record.getId(),
                packageId: this.packageData.id
            },
            hidden: this.packageData.status !== 'Fulfilled'
        }];


        this.collapsedInfo = {
            xtype: 'component',
            flex: 1,
            tpl: [
                '{date} | Tracking Number {trackingNumber} | {itemCount} ',
                'item<tpl if="itemCount !== 1">s</tpl>'
            ],
            data: {
                date: Ext.Date.format(new Date(this.packageData.shipDate), 'm/d/Y h:i:s a'),
                trackingNumber: this.packageData.trackingNumber,
                itemCount: this.packageData.totalQuantity
            }
        };

        this.collapsedActions = [{
            text: 'Print Packing Slip',
            handler: this.handlePrintPackingSlip
        }, {
            xtype: 'resendemailbutton',
            margin: '0 0 0 10',
            emailUrl: '/admin/app/order/shipping/package/resendshipmentemail',
            jsonData: {
                orderId: this.record.getId(),
                packageId: this.packageData.id
            },
            hidden: this.packageData.status !== 'Fulfilled'
        }];

        this.callParent(arguments);
    },

    handlePrintPackingSlip: function () {
        var siteId = this.record.get('siteId'),
            orderId = this.record.getId(),
            packageId = this.packageData.id;
        window.open('/admin/s-' + siteId + '/orderdetails/' + orderId + '/packages/' + packageId);
    },

    handleOverrideWeight: function () {
        Ext.create('Taco.view.order.modal.OverrideTotalWeight', {
            record: this.packageData,
            listeners: {
                scope: this,
                aftersaveclose: function (dialog, data) {
                    this.packageData.weight = data.weight;

                    this.updateOrder({
                        methodName: 'changePackageWeight',
                        errorMsg: 'Error changing package weight',
                        data: [this.packageData]
                    });
                }
            }
        });
    },

    handleViewShippingLabel: function () {
        window.open(
            '/admin/app/order/shipping/package/label?orderId=' + this.record.getId() + '&packageId=' + this.packageData.id,
            'mozu-shippingLabel-' + this.record.getId() + '-' + this.packageData.id
        );
    },

    handleGetShippingLabel: function () {
        this.updateOrder({
            methodName: 'prepareShipment',
            errorMsg: 'Error preparing shipping label',
            data: {
                orderId: this.record.getId(),
                packageIds: [this.packageData.id],
                defaultWeight: this.packageData.weight,
                defaultPackagingType: this.packageData.packagingType
            }
        });
    },

    handleAddTrackingNumber: function () {
        Ext.create('Taco.view.order.modal.EditTrackingNumber', {
            packageData: this.packageData,
            record: this.record,
            autoShow: true
        });
    },

    handleCancel: function () {
        this.updateOrder({
            methodName: 'deletePackage',
            errorMsg: 'Error deleting package',
            data: {
                orderId: this.record.getId(),
                packageIds: [this.packageData.id]
            }
        });
    },

    handleMarkAsShipped: function () {
        this.updateOrder({
            methodName: 'markPackagesShipped',
            errorMsg: 'Error marking as shipped',
            data: {
                orderId: this.record.getId(),
                packageIds: [this.packageData.id]
            }
        });
    },

    handleShippingMethod: function (menu, item) {
        if (!item.methodCode) return;

        this.packageData.shippingMethodCode = item.methodCode;
        this.packageData.shippingMethodName = item.methodName;
        
        this.updateOrder({
            methodName: 'changeShippingMethod',
            errorMsg: 'Error changing shipping method on package',
            data: [this.packageData]
        });
    },

    handlePackagingType: function (menu, item) {
        this.packageData.packagingType = item.packagingType;

        this.updateOrder({
            methodName: 'changePackagingType',
            errorMsg: 'Error changing packaging type on package',
            data: [this.packageData]
        });
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
    }
});
