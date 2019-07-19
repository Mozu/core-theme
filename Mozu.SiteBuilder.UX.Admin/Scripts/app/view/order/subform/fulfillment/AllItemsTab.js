
Ext.define('Taco.view.order.subform.fulfillment.AllItemsTab', {
    extend: 'Taco.view.order.subform.Subform',

    tabTitle: 'All Items',
    isEditable: false,
    initComponent: function () {

        this.cls += ' orderform-package-packagetab';
        this.initUI();
        this.callParent(arguments);

        //this.needToReload = true;
        //this.mon(this.record, 'reload', function() {
        //    // Only bother reloading if the order has changed.
        //    this.needToReload = true;
        //}, this);
    },

    initUI: function () {

        itemId: this.packageRecord.code + 'shipment';
        this.packageItems = Ext.create('Taco.view.order.widget.ShippingPackagesGrid', {
            shipmentRecord: this.shipmentRecord,
            record: this.record,
            hidden: this.shipmentRecord.shipmentStatus == 'Cancelled',
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0'
        });
        

        this.items = [
            this.buildAllItemsActions(),
            this.packageItems
        ];
    },

    buildAllItemsActions: function () {
        this.items = [];
        var me = this;
        isEditable = me.isEditable;
        this.totalsContainer = Ext.widget({
            xtype: 'container',
            cls: 'taco-order-fulfillment-package-body',
            padding: '0 0 10 0',
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
                    hidden: this.shipmentRecord.shipmentStatus != 'Cancelled',
                    flex: 1,
                    html: '<h3 class="">Shipment is cancelled, see all items on the cancellation tab.</h3>',
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
                            itemId: 'cancelShipmentTotals',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Cancel',
                            hidden: !me.isEditable,
                            handler: function (evt) {
                                me.toggleEdit();
                            }
                        }),
                        Ext.widget('button', {
                            itemId: 'saveShipmentTotals',
                            ui: 'action-primary',
                            scale: 'medium',
                            text: 'Save',
                            hidden: !me.isEditable,
                            margin: {
                                left: 10,
                                right: 70
                            },
                            handler: function (evt) {
                                me.toggleEdit();
                            }
                        }),
                        Ext.widget('button', {
                            itemId: 'editShipmentTotals',
                            ui: 'action',
                            scale: 'medium',
                            text: 'Edit',
                            margin: '0 20 0 0',
                            hidden: me.isEditable,//me.isShipmentAction(),
                            handler: function (evt) {
                                me.toggleEdit();
                                var grid = me.packageItems.getView();
                                grid.getSelectionModel().checkOnly = true;
                                var selected = grid.getSelectionModel().getSelection();
                                grid.editingPlugin.startEditByPosition({ row: selected[0].$extCollectionIndex, column: 5 });
                            }
                        }),
                        Ext.widget('splitbutton', {
                            menuAlign: 'tr-br?',
                            margin: '0 20 0 0',
                            text: 'Reassign Item',
                            itemId: 'reassignItemSplitButton',
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


                                                        Ext.create('Taco.view.order.modal.fulfillment.ItemsReassign', {
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
                        }),
                        Ext.widget('splitbutton', {
                            menuAlign: 'tr-br?',
                            margin: '0 20 0 0',
                            text: 'Update Item Status',
                            itemId: 'updateItemSplitButton',
                            handler: function () {

                            },
                            hidden: me.isShipmentAction(),
                            menu: me.getShipmentLevelSplitMenu(),
                            ui: 'action',
                            scale: 'medium',
                        })
                    ]
                }
            ],
            listeners: {
                afterrender: function (obj) { 
                    me.updateUI();
                }
            }
        });
        return this.totalsContainer;
        //this.items.push(this.totalsContainer);
    },

    updateUI: function () {
        isEditable = this.isEditable;
    },

    getShipmentLevelSplitMenu: function () {

        var actionCancelItem = {
            text: 'Cancel Item',
            handler: function () { }
        };

        var actionMoveToBackorder = {
            text: 'Move To backorder',
            handler: function () { }
        };

        var actionEditItem = {
            text: 'Edit Item',
            handler: function () { }
        };

        if (this.shipmentRecord.shipmentStatus == 'Ready') {
            return [
                actionMoveToBackorder,
                actionEditItem,
                actionCancelItem
            ];
        }
        else if (this.shipmentRecord.shipmentStatus == 'Backorder') {
            return [
                actionEditItem,
                actionCancelItem
            ];
        }
        else if (this.shipmentRecord.shipmentStatus == 'Customer Care') {
            return [
                actionMoveToBackorder,
                actionEditItem,
                actionCancelItem
            ];
        }
    },

    isShipmentAction: function () {
        if (this.shipmentRecord.shipmentStatus == 'Fulfilled' || this.shipmentRecord.shipmentStatus == 'Cancelled')
            return true;
        return false;
    },

    onDestroy: function () {
        this.callParent(arguments);
    },

    toggleEdit: function () {
        if (this.isEditable) {
            this.isEditable = false;
            this.totalsContainer.items.items[2].items.get('saveShipmentTotals').hide();
            this.totalsContainer.items.items[2].items.get('cancelShipmentTotals').hide();
            this.totalsContainer.items.items[2].items.get('editShipmentTotals').show();
        }
        else {
            this.isEditable = true;
            this.totalsContainer.items.items[2].items.get("saveShipmentTotals").show();
            this.totalsContainer.items.items[2].items.get('cancelShipmentTotals').show();
            this.totalsContainer.items.items[2].items.get('editShipmentTotals').hide();
        }
        this.updateUI();
    },

});