Ext.define('Taco.view.order.modal.fulfillment.ShipmentReassign', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.Form',
        'Ext.grid.View',
        'Ext.layout.container.Card',
        'Ext.tab.Bar',
        'Ext.form.field.Number',
        'Ext.toolbar.TextItem'
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Save',
    secondaryText: 'Cancel',
    scale: 'large',
    title: 'Shipment Reassign',
    isRecordSaved: false,
    layout: {
        type: 'fit'
    },

    initComponent: function () {
        var me = this;
        var itemsPerPage = 2;
        var shipment = me.shipmentData;

        var inventoryStore = Ext.create('Ext.data.Store', {
            storeId: 'inventoryStore',
            autoLoad: false,
            //autoLoad: { start: 0, limit: 5 },
            pageSize: itemsPerPage,
            remoteSort: true,
            sorters: [{
                property: 'locationName',
                direction: 'asc'
            }],
            fields: ['locationName', 'distance', 'stock'],
            groupField: 'locationName',
            data: this.inventoryData.candidateSuggestions,
            proxy: {
                type: 'memory',

                reader: {
                    type: 'json',
                    root: 'items',
                    totalProperty: 'total',
                    enablePaging: true
                }
            }
        });

        // specify segment of data you want to load using params
        inventoryStore.load({
            params: {
                start: 0,
                limit: itemsPerPage
            }
        });

        //var nameRenderer = function () {
        //    return '<div ext-xtype="radiofield"></div>';

        //}
        var inventorygrid = Ext.create('Ext.grid.Panel', {
            title: 'Inventory',
            cls: 'taco-order-fulfillment-ReassignShipment',
            //features: [{
            //    ftype: 'grouping'
            //}],

            store: Ext.data.StoreManager.lookup('inventoryStore'),
            //viewConfig: {
            //    listeners: {
            //        // Column Autosize to its data
            //        refresh: function (dataview) {
            //            Ext.each(dataview.panel.columns, function (column) {
            //                if (column.autoSizeColumn === true) column.autoSize();
            //            })
            //        }
            //    }
            //},
            columns: [
                {
                    text: 'Location',
                    dataIndex: 'locationName',
                    width: 500,
                },
                {
                    text: 'Distance', dataIndex: 'distance', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150
                },
                {
                    xtype: 'actioncolumn',
                    text: 'Stock',
                    dataIndex: 'stock',
                    renderer: function (v, meta, rec) {
                        var inventory = rec.raw.inventory;
                        var type = "";

                        var filteredInventory;
                        shipment.items.forEach(function (element) {
                            filteredInventory = inventory.filter(function (obj) {
                                return (obj.partNumber === element.productCode);
                            });
                            switch (type) {
                                case "":
                                    if (filteredInventory.length > 0) {
                                        if (filteredInventory[0].available >= element.quantity) {
                                            type = "checked";
                                        }
                                        else if (filteredInventory[0].available > 0) {
                                            type = "partial";
                                        }
                                        else {
                                            type = "delete";
                                        }
                                    }
                                    else {
                                        type = "delete";
                                    }
                                    break;

                                case "checked":
                                    if (filteredInventory.length > 0) {
                                        if (filteredInventory[0].available >= element.quantity) {
                                            type = "checked";
                                        }
                                        else if (filteredInventory[0].available > 0) {
                                            type = "partial";
                                        }
                                        else {
                                            type = "delete";
                                        }
                                    }
                                    else {
                                        type = "partial";
                                    }
                                    break;

                                case "partial":
                                    type = "partial";
                                    break;

                                case "delete":
                                    if (filteredInventory.length > 0 && filteredInventory[0].available > 0) {
                                        type = "partial";
                                    }
                                    else {
                                        type = "delete";
                                    }
                                    break;
                            }
                        })

                        switch (type) {
                            case 'checked': return '<button class="btn btn-yes">Yes</button>';
                            case 'partial': return '<button class="btn btn-partial">Partial</button>';
                            default: return '<button class="btn btn-no">No</button>';
                        }
                    }
                }
            ],
            height: 150,
            width: 1000,

            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: inventoryStore,   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            }],
            selModel: {
                selModel: 'rowmodel',
                //    seltype: 'checkboxmodel', 
                //    mode: 'single',    
                //    checkonly : true
            },
            plugins: {
                ptype: 'cellediting',
                clicksToEdit: 1,
                autoCancel: false
            },
            singleSelect: true,
            listeners: {
                selectionchange: function () {
                },
                select: function (obj) {
                    me.shipmentLocation = obj.lastSelected.raw;
                },
                deselect: function () {
                    me.shipmentLocation = null;
                }
                //beforeload: function (store, operation, eOpts) {

                //    store.proxy.data = inventoryData;
                //}
            },

        });

        Ext.create('Ext.data.Store', {
            storeId: 'allLocationsStore',
            fields: ['locationName', 'distance', 'stock'],
            groupField: 'locationName',
            data: this.inventoryData.candidateSuggestions,
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        var allLocations = Ext.create('Ext.grid.Panel', {
            title: 'All Locations',
            store: Ext.data.StoreManager.lookup('allLocationsStore'),
            columns: [
                {
                    text: 'Location',
                    dataIndex: 'locationName',
                    width: 500,
                },
                {
                    text: 'Distance', dataIndex: 'distance', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150
                },
                {
                    text: 'Stock', dataIndex: 'stock', width: 150,
                },
            ],
            height: 200,
            width: 400
        });

        this.fieldContainer = Ext.create('Ext.tab.Panel', {
            width: 1000,
            height: 300,
            renderTo: Ext.getBody(),
            items: [
                inventorygrid,
                allLocations
            ]
        });

        this.items = [this.fieldContainer];

        this.callParent(arguments);

    },
    doSave: function () {
        if (this.validateModal()) {
            var me = this;

            Ext.MessageBox.show({
                title: 'Reassign Shipment',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: 'Are you certain you want to reassign the shipment to selected location?',
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {

                        me.setLoading(true, me.body);
                        var order = me.record;
                        var payloadData = me.shipmentLocation;
                        order.reassignShipment({
                            jsonData: payloadData,
                            success: function (response) {
                                me.isRecordSaved = true;
                                me.setLoading(false, me.body);
                                var json = Ext.decode(response.responseText, true);
                                if (!json || !json.success) {
                                    return;
                                }
                                me.saveSuccess(json);
                                // close the dialog
                                me.close();
                            },
                            failure: function (response) {
                                me.setLoading(false, me.body);
                                // close the dialog
                                me.close();
                            }
                        });
                    }
                }
            });
        }
    },

    validateModal: function () {     
        var me = this;
        if (!me.shipmentLocation)
            return false;

        return true;
    },

    //getCancelItemQuantityPayload: function () {
    //    var me = this;
    //    var order = this.record;
    //    var reason = this.down('#cancelReason').getValue();
    //    var description = (this.down('[name=otherReason]').isVisible() ?
    //        this.down('#otherReason').getValue() : null);

    //    return {
    //        orderId: order.get('taco.model.order_id'),
    //        orderItemId: order.get('id'),
    //        quantity: this.down('#cancelQuantity').getValue(),
    //        reason: {
    //            reasonCode: reason,
    //            description: description
    //        }
    //    };
    //},

    //doSave: function () {

    //    if (this.validateModal()) {
    //        var me = this;

    //        Ext.MessageBox.show({
    //            title: 'Cancel Item',
    //            // pushes the buttons to the right to be consistant with our dialog ux.
    //            rightJustifyButtons: true,
    //            // reverses the order of the buttons
    //            reverseOrder: true,
    //            msg: 'Are you certain you want to Cancel this item?',
    //            closable: false,
    //            buttons: Ext.Msg.YESNO,
    //            fn: function (val) {
    //                if (val === 'yes') {

    //                    me.setLoading(true, me.body);
    //                    var order = me.parentRecord;
    //                    var payloadData = me.getCancelItemQuantityPayload();
    //                    order.cancelItemQuantity({
    //                        jsonData: payloadData,
    //                        success: function (response) {
    //                            me.isRecordSaved = true;
    //                            me.setLoading(false, me.body);
    //                            var json = Ext.decode(response.responseText, true);
    //                            if (!json || !json.success) {
    //                                return;
    //                            }
    //                            me.saveSuccess(json);
    //                            // close the dialog
    //                            me.close();
    //                        },
    //                        failure: function (response) {
    //                            me.setLoading(false, me.body);
    //                            // close the dialog
    //                            me.close();
    //                        }
    //                    });
    //                }
    //            }
    //        });
    //    }
    //},
    ///**
    //* Do any class level cleanup. Destroy and null any scoped refs.     
    //*/
    //onDestroy: function (destroy) {
    //    if (!this.isRecordSaved && this.originalQuantity)
    //        this.record.set('quantity', this.originalQuantity);
    //    this.callParent(arguments);
    //}
});

