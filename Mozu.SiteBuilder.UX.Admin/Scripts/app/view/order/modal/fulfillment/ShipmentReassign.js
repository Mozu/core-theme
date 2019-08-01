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
        var selectedTab;
        this.selectedTab = 'inventoryGrid';
        var inventoryStore = Ext.create('Ext.data.Store', {
            storeId: 'inventoryStore',
            //autoLoad: false,
            autoLoad: { start: 0, limit: 2 },
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
                    root: 'rows',
                    totalProperty: 'totalCount',
                    enablePaging: true
                }
            }
        });

        // specify segment of data you want to load using params
        //inventoryStore.load({
        //    params: {
        //        start: 0,
        //        limit: this.itemsPerPage
        //    }
        //});

     
        var inventorygrid = Ext.create('Ext.grid.Panel', {
            title: 'Inventory',
            cls: 'taco-order-fulfillment-ReassignShipment',
            itemId: 'inventoryGrid',

            store: Ext.data.StoreManager.lookup('inventoryStore'),
           
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
            },

        });

        Ext.create('Ext.data.JsonStore', {
            storeId: 'allLocationsStore',
            fields: ['displayName'],
            groupField: 'displayName',
            
            //data: me.record.locationsStore.data.items,
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
            store: me.record.getLocations(),
            itemId: 'allLocationsGrid',
            columns: [
                {
                    text: 'Location',
                    dataIndex: 'displayName',
                    width: 500,
                },
                {
                    text: 'Location Code',
                    dataIndex: 'displayName',
                    width: 500,
                }
            ],
            height: 200,
            width: 400
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
            ],

            
        });

        this.items = [this.fieldContainer];

        this.callParent(arguments);

    },

    doSave: function () {
        if (this.validateModal()) {
            var me = this;
            me.setLoading(true, this.body);
            var payloadData = me.getPayloadDataInventory();

                        this.record.reassignShipment({
                            jsonData: payloadData,
                            success: function (response) {
                                me.isRecordSaved = true;
                                me.setLoading(false, me.body);
                                var json = Ext.decode(response.responseText, true);
                                
                                if (!json || !json.success) {
                                    Taco.app.fireEvent('setmessage', json.response, 'error');
                                    return;
                                }
                                me.saveSuccess(json);
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
    

    validateModal: function () {     
        var me = this;
        var grid = me.selectedTab == 'inventoryGrid' ? Ext.ComponentQuery.query('#inventoryGrid')[0] 
            : Ext.ComponentQuery.query('#allLocationsGrid')[0]; 
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;
        if (selectedItem.name || selectedItem.locationName) {
            return true;
        }

        return true;
    },

    getPayloadDataInventory: function () {
        var me = this;
        var grid = me.selectedTab == 'inventoryGrid' ? Ext.ComponentQuery.query('#inventoryGrid')[0]
            : Ext.ComponentQuery.query('#allLocationsGrid')[0]; 
        var item = grid.getSelectionModel().getSelection();
        var selectedItem = item[0].data;
        return {
            ShipmentNumber: me.shipmentRecord.number,
            ReassignShipment: {
                LocationCode: grid.itemId == "inventoryGrid" ? item[0].raw.locationCode : selectedItem.code,
            }
        };
    },
});

