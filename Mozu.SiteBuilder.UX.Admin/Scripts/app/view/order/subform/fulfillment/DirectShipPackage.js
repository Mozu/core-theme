Ext.define('Taco.view.order.subform.fulfillment.DirectShipPackage', {
    extend: 'Taco.view.order.subform.fulfillment.Package',

    requires: [
        'Taco.view.order.subform.fulfillment.Grid'
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

            if (this.shippingMethodsStore.count() === 0 && !this.shippingMethodsStore.isLoading()) {
                this.shippingMethodsStore.load();
            }
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
                    '{firstName}<tpl if="middleName"> {middleName}</tpl> {lastName}<br>',
                    '{address1}<br>',
                    '<tpl if="address2">{address2}<br></tpl>',
                    '<tpl if="address3">{address3}<br></tpl>',
                    '<tpl if="address4">{address4}<br></tpl>',
                    '{cityOrTown}, {stateOrProvince} {postalOrZipCode} {countryCode}',
                    '<tpl if="homePhone"><br>{homePhone}</tpl>',
                    '<tpl if="mobilePhone"><br>{mobilePhone}</tpl>',
                    '<tpl if="workPhone"><br>{workPhone}</tpl>'
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
                            menu.removeAll();
                            menu.add(this.buildShippingMethods());
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
                            text: ''
                        }]
                    }
                }, {
                    html: this.packageData.shippingMethodName
                }, {
                    margin: '8 0 0 0',
                    tpl: [
                        '<span class="label">Total Weight:</span><br>{weight}'
                    ],
                    data: this.packageData
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
            hidden: this.packageData.status === 'Fulfilled' || !this.packageData.shipmentId,
            handler: this.handleMarkAsShipped
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

        this.collapsedActions = {
            text: 'Print Packing Slip',
            handler: this.handlePrintPackingSlip
        };

        this.callParent(arguments);
    },

    handlePrintPackingSlip: function () {
        var win = window.open(),
            data = {
                shippingMethodName: this.packageData.shippingMethodName,
                items: this.packageData.items,
                billingContact: this.record.get('billingContact'),
                fulfillmentContact: this.record.get('fulfillmentContact'),
                payments: this.record.get('payments'),
                order: this.record.getData(),
                orderRecord: this.record,
                siteName: Taco.app.context.getSite().name
            },
            tpl = new Ext.XTemplate(
                '<div style="font: 14px/1.5 sans-serif;">',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody><tr>',
                '<td style="padding: 4px 30px 20px 4px; width: 100%;">',
                '<h1 style="margin: 0px;">{siteName}</h1>',
                '</td>',
                '<td style="padding: 4px 30px 20px 4px;">',
                '<h2 style="margin: 0px; white-space: nowrap;">PACKING SLIP</h2>',
                '<table style="border-collapse: collapse; border-spacing: 0px;"><tbody><tr>',
                '<td style="padding: 4px 30px 4px 4px;">',
                '<div style="font-weight: bold; white-space: nowrap;">Date:</div>',
                '<div style="white-space: nowrap;">{order.createDate:date("M d g:ia")}</div>',
                '</td>',
                '<td style="padding: 4px 30px 4px 4px;">',
                '<div style="font-weight: bold; white-space: nowrap;">Order #:</div>',
                '<div style="font-weight: bold; white-space: nowrap;">{order.orderNumber}</div>',
                '</td>',
                '</tr></tbody></table>',
                '</td>',
                '</tr></tbody></table>',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody>',
                '<tr>',
                '<td style="font-weight: bold;">Bill To: (Customer ID #1)</td>',
                '<td style="font-weight: bold;">Ship To:</td>',
                '</tr>',
                '<tr>',
                '<td style="border-top: 2px solid black; padding: 4px 30px 20px 4px;">',
                '<div>{billingContact.firstName} {billingContact.lastName}</div>',
                '<div>{billingContact.address1}</div>',
                '<div>{billingContact.cityOrTown}, {billingContact.stateOrProvince} {billingContact.postalOrZipCode}</div>',
                '<div>{billingContact.countryCode}</div>',
                '<div>{billingContact.homePhone}</div>',
                '<div>{billingContact.email}</div>',
                '</td>',
                '<td style="border-top: 2px solid black; font-size: 16px; font-weight: bold; padding: 4px 30px 20px 4px;">',
                '<div>{fulfillmentContact.firstName} {fulfillmentContact.lastName}</div>',
                '<div>{fulfillmentContact.address1}</div>',
                '<div>{fulfillmentContact.cityOrTown}, {fulfillmentContact.stateOrProvince} {fulfillmentContact.postalOrZipCode}</div>',
                '<div>{fulfillmentContact.countryCode}</div>',
                '<div>{fulfillmentContact.homePhone}</div>',
                '<div>{fulfillmentContact.email}</div>',
                '</td>',
                '</tr>',


                '<tr>',
                '<td style="font-weight: bold;">Payment Method:</td>',
                '<td style="font-weight: bold;">Shipping Method:</td>',
                '</tr>',
                '<tr>',
                '<td style="border-top: 2px solid black; font-weight: bold; padding: 4px 30px 20px 4px;">',
                '<tpl for="payments">',
                '<tpl if="values.status!=\'Voided\'">',
                '<div>{paymentType}<div>',
                '</tpl>',
                '</tpl>',
                '</td>',
                '<td style="border-top: 2px solid black; padding: 4px 30px 20px 4px;">{shippingMethodName}</td>',
                '</tr>',

                '</tbody></table>',
                '<table style="border-collapse: collapse; border-spacing: 0px; width: 100%;"><tbody>',
                '<tr>',
                '<td style="font-weight: bold; white-space: nowrap;">Code</td>',
                '<td style="font-weight: bold; white-space: nowrap;">Name</td>',
                '<td style="font-weight: bold; white-space: nowrap;">Qty</td>',
                '<td style="font-weight: bold; white-space: nowrap;">Price</td>',
                '<td style="font-weight: bold; white-space: nowrap;">Total</td>',
                '</tr>',
                '<tpl for="items"><tr>',
                '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{productCode}</td>',
                '<td style="border-top: 2px solid black; font-weight: bold; padding: 4px 30px 15px 4px; width: 100%;">{productName}</td>',
                '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{quantity}</td>',
                '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{[values.orderRecord.formatCurrency(values.unitPrice)]}</td>',
                '<td style="border-top: 2px solid black; padding: 4px 30px 15px 4px; white-space: nowrap;">{[values.orderRecord.formatCurrency(values.total)]}</td>',
                '</tr></tpl>',
                '</tbody></table>',
                '</div>'
            ),
            html = tpl.apply(data);

        Ext.fly(win.document.body).setHTML(html);
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