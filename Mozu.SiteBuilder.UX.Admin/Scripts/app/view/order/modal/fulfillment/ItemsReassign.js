Ext.define('Taco.view.order.modal.fulfillment.ItemsReassign', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.Form',
        'Ext.grid.View',
        'Ext.layout.container.Card',
        'Ext.tab.Bar',
        'Ext.form.field.Number',
        'Ext.toolbar.TextItem',
        'Ext.grid.CellEditor',
        'Ext.util.DelayedTask',
        'Ext.ux.data.PagingMemoryProxy'
    ],

    autoShow: true,
    closeAction: 'destroy',
    primaryText: 'Save',
    secondaryText: 'Cancel',
    scale: 'large',
    title: 'Items Reassign',
    isRecordSaved: false,
    layout: {
        type: 'fit'
    },
    orderedQuantity: 0,

    initComponent: function () {
        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1,
            pluginId: 'cellEditing'
        });
        var me = this;
        me.orderedQuantity = me.selectedItem.quantity;
        this.filteredInventory = [];
        if (this.inventoryItemList.candidateSuggestions && this.inventoryItemList.candidateSuggestions.length > 0) {
            this.filteredInventoryLocations(this.inventoryItemList.candidateSuggestions);
        }
        if (this.inventoryItemList.items && this.inventoryItemList.items.length > 0) {
            this.filteredInventoryLocations(this.inventoryItemList.items);
        }
        var selectedTab;
        this.selectedTab = 'inventoryGrid';
        var inventoryStore = Ext.create('Ext.data.Store', {
            storeId: 'ItemInventoryStore',
            autoLoad: false,
            //autoLoad: { start: 0, limit: 5 },
            pageSize: 5,
            remoteSort: true,
            sorters: [{
                property: 'location',
                direction: 'asc'
            }],
            fields: ['locationName', 'distance', 'available', 'orderedQty', 'reassignQty'],
            groupField: 'locationName',
            data: this.inventoryItemList.candidateSuggestions || this.inventoryItemList.items,
            proxy: {
                type: 'memory',
                enablePaging: true,
                reader: {
                    type: 'json',
                    root: 'items',
                    totalProperty: 'total',
                }
            }
        });

        // specify segment of data you want to load using params
        inventoryStore.load({
            params: {
                start: 0,
                limit: 5
            }
        });

        var inventorygrid = Ext.create('Ext.grid.Panel', {
            title: 'Inventory',
            cls: 'taco-order-fulfillment-ReassignItems',
            store: Ext.data.StoreManager.lookup('ItemInventoryStore'),
            itemId: 'inventoryGrid',
            columns: [
                {
                    header: 'Location',
                    dataIndex: 'locationName',
                    width: 200,
                },
                {
                    header: 'Distance',
                    dataIndex: 'distance',
                    flex: 1,
                    width: 50,
                    autoSizeColumn: true,
                    minWidth: 150,
                    renderer: Ext.util.Format.numberRenderer('0.00')
                },
                {
                    text: 'Available',
                    dataIndex: 'available',
                    flex: 1,
                    width: 50,
                    autoSizeColumn: true,
                    minWidth: 150,
                    renderer: function (val, meta, record) {
                        return val;
                    }
                },
                {
                    text: 'Qty Ordered', dataIndex: 'orderedQty', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150,
                    renderer: function (val, meta, record) {
                        if (me.selectedItem)
                            return me.selectedItem.quantity;
                    }
                },
                {
                    text: 'Qty to reassign', dataIndex: 'reassignQty', width: 150,
                    editor: {
                        xtype: 'textfield',
                        cls: 'x-grid-checkheader-editor',
                        inputValue: true,
                        regex: /^\d{0,9}$/,
                        regexText: "Invalid Number entered.",
                        uncheckedValue: false,
                        minValue: 1,
                        maxValue: me.selectedItem.quantity,
                        validator: function (value) {
                            if (!isNaN(value)) {
                                return (value <= me.orderedQuantity) || 'Quantity to reassign should be less than ordered quantity';
                            }
                        }
                    }
                },
            ],
            height: 500,
            width: 1000,

            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: 'ItemInventoryStore',   // same store GridPanel is using
                dock: 'bottom',
                displayInfo: true
            }],
            selModel: {
                selModel: 'cellmodel',
            },
            plugins: [this.cellEditing],
            //{   
                //ptype: 'cellediting',
                //clicksToEdit: 1,
                //autoCancel: false,
                //pluginId: 'ItemLocationEditing',
            //},
            listeners: {
                'validateedit': function (editor, context, eOpts) {
                    var me = this;
                    for (var i = 0; i < context.record.store.data.items.length; i++) {
                        if (i !== context.rowIdx && context.value !=='') {
                            if ((context.record.store.data.items[i].data.reassignQty) && (context.record.store.data.items[i].data.reassignQty > 0 )) {
                                context.record.store.data.items[i].data.reassignQty = '';
                            }
                        }
                        if (i === context.rowIdx) {
                            context.record.store.data.items[i].data.reassignQty = context.record.store.data.items[i].data.reassignQty;
                        }
                    }
                    me.getView().refresh();
                    if (context.value > me.orderedQuantity) {
                        alert('Quantity to reassign should be less than ordered quantity.');
                        return false;
                    }
                }
            },
        });
        var allLocationsStore = Ext.create('Ext.data.Store', {
            storeId: 'allLocationsStore',
            fields: ['name', 'code'],
            autoLoad: false,
            pageSize: 5,
            proxy: {
                type: 'ajaxproxy',
                url: '/admin/app/location/list?shipmentType=' + me.shipmentRecord.shipmentType + '&pickupCode=' + (me.shipmentRecord.location ? me.shipmentRecord.location.code : ''),
                reader: {
                    type: 'json',
                    root: 'items',
                    totalProperty: 'total'
                }
            }
        });
        allLocationsStore.load({
            params: {
                start: 0,
                limit: 5,
            }
        });
        var allLocations = Ext.create('Ext.grid.Panel', {
            title: 'All Locations',
            cls: 'taco-order-fulfillment-locations',
            store: 'allLocationsStore',
            itemId: 'allLocationsGrid',
            columns: [
                {
                    text: 'Location',
                    dataIndex: 'name',
                    width: 425,
                },
                {
                    text: 'Location Code',
                    dataIndex: 'code',
                    width: 425,
                },
                {
                    text: 'Qty to reassign', dataIndex: 'reassignQty', width: 150,
                    editor: {
                        xtype: 'textfield',
                        cls: 'x-grid-checkheader-editor',
                        inputValue: true,
                        uncheckedValue: false,
                        minValue: 1,
                        maxValue: me.selectedItem.quantity,
                        width: 425,
                        regex: /^\d{0,9}$/,
                        regexText: "Invalid Number entered.",
                        validator: function (value) {
                            if (!isNaN(value)) {
                                return (value <= me.orderedQuantity) || 'Quantity to reassign should be less than ordered quantity';
                            }
                        }
                    }
                },
            ],
            height: 200,
            width: 400,
            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: 'allLocationsStore',
                dock: 'bottom',
                displayInfo: true
            }],
            selType: 'cellmodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            listeners: {
                'validateedit': function (editor, context, eOpts) {
                    var me = this;
                    for (var i = 0; i < context.record.store.data.items.length; i++) {
                        if (i !== context.rowIdx && context.value !== '') {
                            if ((context.record.store.data.items[i].data.reassignQty) && (context.record.store.data.items[i].data.reassignQty > 0)) {
                                context.record.store.data.items[i].data.reassignQty = '';
                            }
                        }
                        if (i === context.rowIdx) {
                            context.record.store.data.items[i].data.reassignQty = context.record.store.data.items[i].data.reassignQty;
                        }
                    }
                    me.getView().refresh();
                }
            },
        });                   

        this.fieldContainer = Ext.create('Ext.tab.Panel', {
            width: 1000,
            height: 300,
            listeners: {
                beforetabchange: function (tabs, newTab, oldTab) {
                    if (newTab.itemId == 'allLocationsGrid') {
                        me.selectedTab = 'allLocationsGrid';
                    }
                    else if (newTab.itemId == 'inventoryGrid') {
                        me.selectedTab = 'inventoryGrid';
                    }
                }
            },
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
            me.setLoading(true, this.body);
            var payloadData = me.getPayloadDataItemInventory();

            this.record.reassignShipmentItems({
                jsonData: payloadData,
                success: function (response) {
                    me.isRecordSaved = true;
                    me.setLoading(false, me.body);
                    var json = Ext.decode(response.responseText, true);

                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', json.response, 'error');
                        return;
                    }
                    Taco.app.fireEvent('setmessage', "Item " + payloadData.reassignItemsRequest.items[0].name + " Successfully Reassigned", 'success');
                    me.saveSuccess(json);
                    me.close();
                    // close the dialog

                },
                failure: function (response) {
                    me.setLoading(false, me.body);

                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.message) ? json.message : 'Error deallocating inventory';
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    me.close();
                }
            });
        }
    },

    getPayloadDataItemInventory: function () {
        var me = this;
        var grid = me.selectedTab == 'inventoryGrid' ? Ext.ComponentQuery.query('#inventoryGrid')[0]
            : Ext.ComponentQuery.query('#allLocationsGrid')[0]; 
        var item = grid.getSelectionModel().getSelection();
        var selectedLocation = item[0].data;
            if (selectedLocation) {
                return {
                    shipmentNumber: me.shipmentRecord.number,
                    reassignItemsRequest: {
                        items: [{
                            lineId: me.selectedItem.lineId,
                            name: me.selectedItem.name,
                            productCode: me.selectedItem.productCode,
                            fulfillmentLocationCode: grid.itemId == "inventoryGrid" ? item[0].raw.locationCode : item[0].raw.code,
                            quantity: selectedLocation.reassignQty,
                            imageUrl: me.selectedItem.imageUrl,
                            retailPrice: me.selectedItem.actualPrice,
                            optionAttributeFQN: me.selectedItem.optionAttributeFQN,
                            unitPrice: me.selectedItem.unitPrice,
                            variationProductCode: me.selectedItem.variationProductCode
                        }]
                    }
                };
            }
    },

    validateModal: function () {
        var me = this;
        var grid = me.selectedTab == 'inventoryGrid' ? Ext.ComponentQuery.query('#inventoryGrid')[0]
            : Ext.ComponentQuery.query('#allLocationsGrid')[0];
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;
        if (grid.itemId == 'allLocationsGrid') {
            if (selectedItem.name || selectedItem.locationName) {
                return true;
            }
        }
        else if (grid.itemId == 'inventoryGrid' && selectedItem) {
            if (selectedItem.reassignQty > 0) {
                return true;
            }
        }

        return false;
       
    },


    filteredInventoryLocations: function (inventoryLocations) {
        var me = this;
        for (var i = 0; i < inventoryLocations.length; i++) {
            if (me.shipmentRecord.location && inventoryLocations[i].locationCode == me.shipmentRecord.location.code) {
                inventoryLocations.splice(i, 1);
            }
        }
    },
    
});
