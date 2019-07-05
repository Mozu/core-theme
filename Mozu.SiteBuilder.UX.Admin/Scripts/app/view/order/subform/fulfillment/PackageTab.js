/**
 * @class Taco.view.order.subform.fulfillment.Packages
 */
Ext.define('Taco.view.order.subform.fulfillment.PackageTab', {
    extend: 'Taco.view.order.subform.Subform',
    requires: [
        'Taco.view.order.modal.OverrideTotalWeight',
        'Ext.grid.CellEditor',
        'Ext.util.DelayedTask'
    ],

    selType: 'cellmodel',
       plugins: [],

    initComponent: function () {
        this.tabTitle = this.packageRecord.code;
        this.title = this.packageRecord.code;

        this.cls += ' orderform-package-packagetab';
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
    //    console.log("handleViewShippingLabel");
        window.open(
            '/admin/app/order/shipping/package/label?orderId=' + this.record.getId() + '&packageId=' + this.packageRecord.id,
            'mozu-shippingLabel-' + this.record.getId() + '-' + this.packageRecord.id
        );
    },

    buildTrackingHeader: function () {
        return Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-body',
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
                            itemId: 'editItems',
                            packageItems: this.packageItems,
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
                            //handler: this.handleViewShippingLabel
                            handler: function () {
                            //    console.log("Edit Button Handler","Edit Button Handler")

                            //    console.log(this.packageItems);
                                // this.handleEditLineItem(this.packageItems);
                                var selected = this.packageItems.getSelectionModel().getSelection();
                            //    console.log(selected);
                                // GEt the selected row
                                //plugins: [];
                                //this.plugins.push(
                                //    Ext.create('Ext.grid.plugin.CellEditing', {
                                //        clicksToEdit: 1,
                                //        pluginId: 'editing',
                                //    }));
                            }
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
                            //handler: this.handleViewShippingLabel
                            handler: function (evt) {
                                Ext.create('Taco.view.order.modal.fulfillment.ItemsReassign', {
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
                        //Ext.widget('button', {
                        //    itemId: 'cancelItem',
                        //    ui: 'action',
                        //    scale: 'medium',
                        //    text: 'Cancel Items',

                        //    handler: function () {
                        //        Ext.create('Taco.view.order.modal.fulfillment.OrderCancellation', {
                        //            layout: 'hbox',
                        //            width: 600,
                        //            height: 400,
                        //            //record: record,
                        //            //parentRecord: me.record,
                        //            //store: me.record.getCancellationReasons(),
                        //            //originalQuantity: originalQuantity,
                        //            listeners: {
                        //                saveSuccess: {
                        //                    fn: function (json) {
                        //                        //me.fireEvent('orderCancelled', json);
                        //                    },
                        //                    //scope: me
                        //                }
                        //            }
                        //        });
                        //    }
                        //})
                    ]
                }
            ]
        });
    },

    handleEditLineItem: function (packageItems) {
        var me = this;
        //this.returnableItemsErrorEl.setError('');
        // var returnsStore = this.getReturnsStore();
        var erroredReturns = [];
        var selected = packageItems.getSelectionModel().getSelection();
        // console.log(selected);
        /*var grid = Ext.getCmp("ext-comp-1302");
        selected = grid.getSelectionModel().getSelection();
        console.log(selected);*/
        //if (selected.length === 0) {
        //    this.returnableItemsErrorEl.setError('Please select items to return.');
        //    return;
        //}

        //if (Ext.Array.some(selected, function (item) {
        //    var qf = item.get('quantityFulfilled');
        //    var qr = item.get('quantityReturned');

        //    return (item.get('quantity') > (qf - qr));
        //})) {
        //    this.returnableItemsErrorEl.setError('Item \'Quantity to Return\' exceeds \'Quantity Fulfilled\'.');
        //    return;
        //}

        //// if any items are checked for return, but have quantity == 0, reject this call.
        //if (Ext.Array.some(selected, function (item) {
        //    return !item.get('quantity');
        //})) {
        //    this.returnableItemsErrorEl.setError('Please add a return quantity to all selected items.');
        //    return;
        //}

        //erroredReturns = Ext.Array.filter(selected, function (item) { return item.get('reason') === 'Select'; });
        //if (erroredReturns.length > 0) {
        //    this.returnableItemsErrorEl.setError('Please choose a return reason.');
        //    return;
        //}

        //erroredReturns = Ext.Array.filter(selected, function (item) { return item.get('returnType') === 'Select'; });
        //if (erroredReturns.length > 0) {
        //    this.returnableItemsErrorEl.setError('Please choose a return resolution.');
        //    return;
        //}

        //// Adds a return to the store. Need to sync the store to save it.
        //// The Return.ReturnType is deprecated in favor of specifying return type at the item level.
        //// Use "Replace" for backward compatibility since it provided the most flexibility in the old return state machine.
        //var newReturnRecord = this.createReturn("Replace", selected);

        //this.setLoading(true);
        //returnsStore.sync({
        //    callback: function () {
        //        // Interesting note... callback is called AFTER success/failure.
        //        this.setLoading(false);
        //        this.createButton.setDisabled(false);
        //    },
        //    success: function () {
        //        // Once the new return is created, navigate to it.
        //        Taco.core.StateManager.attemptNavigate('/returns/edit/' + newReturnRecord.data.id);
        //        // after we add the new return we need to reload the order and regenerate the returnable items grid store
        //        //this.record.reload({
        //        //    success: me.refreshReturnableItems,
        //        //    scope: me
        //        //});
        //    },
        //    failure: function (batch) {
        //        returnsStore.remove(newReturnRecord);
        //        var msg = batch.exceptions && batch.exceptions.length && batch.exceptions[0].error && batch.exceptions[0].error.remoteException ? batch.exceptions[0].error.remoteException.data.message : 'Error Creating the Return';
        //        Taco.app.fireEvent('setmessage', msg, 'error');
        //    },
        //    scope: this
        //});
    },

    onDestroy: function () {
        this.callParent(arguments);
    }

});