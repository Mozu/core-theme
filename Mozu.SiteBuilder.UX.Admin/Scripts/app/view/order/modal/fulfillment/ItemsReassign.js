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

    initComponent: function () {
        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1
        });
        var me = this;
        this.filteredInventory = [];
        if (this.inventoryItemList.candidateSuggestions && this.inventoryItemList.candidateSuggestions.length > 0) {
            this.filteredInventory = this.inventoryItemList.candidateSuggestions.filter(location => location.locationCode !== me.shipmentRecord.location.code);
        }
        if (this.inventoryItemList.items && this.inventoryItemList.items.length > 0) {
            this.filteredInventory = this.inventoryItemList.items.filter(location => location.locationCode !== me.shipmentRecord.location.code);
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
            data: this.filteredInventory,
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
                    minWidth: 150
                },
                {
                    text: 'Available',
                    dataIndex: 'available',
                    flex: 1,
                    width: 50,
                    autoSizeColumn: true,
                    minWidth: 150,
                    renderer: function (val, meta, record) {
                        return me.available || val;
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
                        uncheckedValue: false,
                        minValue: 1,
                        maxValue: me.selectedItem.quantity,
                        listeners: {
                            change: {
                                scope: this,
                                fn: function (field, value) { 
                                    me.validateQuantity(value);
                                }
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
                selModel: 'rowmodel',
            },
            plugins: [this.cellEditing],
            //{   
                //ptype: 'cellediting',
                //clicksToEdit: 1,
                //autoCancel: false,
                //pluginId: 'ItemLocationEditing',
            //},
            listeners: {
                selectionchange: function () {
                },
                select: function () {
                    //me.cellEditing.startEditByPosition({
                    //    row: 1,
                    //    column: 5
                    //});
                },
                deselect: function () {
                },
                click: function () {
                }
                //beforeload: function (store, operation, eOpts) {
                //    store.proxy.data = inventoryData;
                //}
            },
        });
        var allLocationsStore = Ext.create('Ext.data.Store', {
            storeId: 'allLocationsStore',
            fields: ['name', 'code'],
            autoLoad: false,
            pageSize: 5,
            proxy: {
                type: 'ajaxproxy',
                url: '/admin/app/location/list?shipmentType=' + me.shipmentRecord.shipmentType +'&pickupCode='+ me.shipmentRecord.location.code,
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
                    width: 500,
                },
                {
                    text: 'Location Code',
                    dataIndex: 'code',
                    width: 500,
                }
            ],
            height: 200,
            width: 400,
            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: 'allLocationsStore',
                dock: 'bottom',
                displayInfo: true
            }],
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
                    Taco.app.fireEvent('setmessage', "Item " +  payloadData.shipmentItems[0].name + " Successfully Reassigned", 'success');
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
                    shipmentItems: [{
                        lineId: me.selectedItem.lineId,
                        name: me.selectedItem.name,
                        productCode: me.selectedItem.productCode,
                        locationCode: grid.itemId == "inventoryGrid" ? item[0].raw.locationCode : item[0].raw.code,
                        quantity: selectedLocation.reassignQty,
                        imageUrl: me.selectedItem.imageUrl,
                        retailPrice: me.selectedItem.actualPrice,
                        optionAttributeFQN: me.selectedItem.optionAttributeFQN,
                        unitPrice: me.selectedItem.unitPrice,
                        variationProductCode: me.selectedItem.variationProductCode
                    }]
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

    validateQuantity: function (quantity) {
        var me = this;
        if (quantity > me.selectedItem.quantity) {
            return false;
        }
    },
    
});
