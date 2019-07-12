
Ext.define('Taco.view.order.subform.fulfillment.AllItemsTab', {
    extend: 'Taco.view.order.subform.Subform',

    tabTitle: 'All Items',

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
            packageStore: this.packageRecord,
            record: this.record,
            margin: '10px 0 10px 0',
            padding: '0 1px 0 0'
        });

        this.items = [
            this.buildAllItemsActions(),
            this.packageItems
        ];
    },

    buildAllItemsActions: function () {
        var me = this;
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
            },
            items: [
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
                            ui: 'action',
                            scale: 'medium',
                            text: 'Edit',
                            margin: '0 20 0 0',
                            hidden: me.isShipmentAction(),
                            handler: function () {

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
                                    handler: function () { }
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
            ]
        });
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
    }

});