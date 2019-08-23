Ext.define('Taco.view.order.modal.fulfillment.ShipmentReassign', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [
        'Taco.core.ux.form.Form',
        'Ext.grid.View',
        'Ext.layout.container.Card',
        'Ext.tab.Bar',
        'Ext.form.field.Number',
        'Ext.toolbar.TextItem',
        'Ext.ux.data.PagingMemoryProxy'
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
        var pagingParams = me.createpagingParams();
        
        this.selectedTab = 'inventoryGrid';
       
        if (this.inventoryData.items.candidateSuggestions && this.inventoryData.items.candidateSuggestions.length > 0) {
            this.filteredInventoryLocations(this.inventoryData.items.candidateSuggestions);
        }
        if (this.inventoryData.items && this.inventoryData.items.length > 0) {
            this.filteredInventoryLocations(this.inventoryData.items);
        }
        var inventoryStore = Ext.create('Ext.data.Store', {
            storeId: 'inventoryStore',
            autoLoad: false,
            //autoLoad: { start: 0, limit: 2 },
            pageSize: 5,
            remoteSort: true,
            sorters: [{
                property: 'locationName',
                direction: 'asc'
            }],
            fields: ['locationName', 'distance', 'stock'],
            groupField: 'locationName',
            data: this.inventoryData.items.candidateSuggestions || this.inventoryData.items,
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
                        if (!me.isInventory) {
                            var inventory = rec.raw.inventory;
                            var type = "";

                            var filteredInventory;
                            shipment.items.forEach(function (element) {
                                filteredInventory = inventory.filter(function (obj) {
                                    return (obj.upc === element.upc);
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
                        }
                        else
                            type = 'checked';

                        switch (type) {
                            case 'checked':
                                return '<span class="x-column-content-pill x-column-content-pill-true">Yes</span>';
                            case 'partial':
                                return '<span class="x-column-content-pill x-column-content-pill-false">Partial</span>';
                            default:
                                return '<span class="x-column-content-pill x-column-content-pill-false">No</span>';
                        }
                    }
                }
            ],
            height: 150,
            width: 1000,
            dockedItems: [{
                xtype: 'pagingtoolbar',
                store: inventoryStore,   
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

        var allLocationsStore = Ext.create('Ext.data.Store', {
            storeId: 'allLocationsStore',
            fields: ['name', 'code'],
            autoLoad: false,
            pageSize: 5,
            proxy: {
                type: 'ajaxproxy',
                url: '/admin/app/location/list?shipmentType=' + me.shipmentRecord.shipmentType + '&pickupCode='+ me.shipmentRecord.location.code,
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
                                Taco.app.fireEvent('setmessage', "Shipment " + payloadData.ShipmentNumber + " successfully reassigned", 'success');
                                me.saveSuccess(json);
                                // close the dialog
                                me.close();
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

    createpagingParams: function () {
        return {
            pagingParams: {
                id: 1,
                startIndex: 1,
                pageSize: 3,
            }
        }
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

    filteredInventoryLocations: function (inventoryLocations) {
        var me = this;
        for (i = 0; i < inventoryLocations.length; i++) {
            if (inventoryLocations[i].locationCode == me.shipmentRecord.location.code) {
                inventoryLocations.splice(i, 1);
            }
        }
    },
});

