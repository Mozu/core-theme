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
        'Ext.ux.data.PagingMemoryProxy',
        'Ext.toolbar.Paging',
        'Ext.view.BoundList',
        'Ext.data.Store'
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
    itemSave: true,
    count: 0,

    

    initComponent: function () {
       
        this.cellEditing = new Ext.grid.plugin.CellEditing({
            clicksToEdit: 1,
            pluginId: 'cellEditing'
        });
        var me = this;
        
        
        me.orderedQuantity = me.selectedItem.quantity;
        this.filteredInventory = [];
        
        if (me.inventoryItemList.items && me.inventoryItemList.items.length > 0) {
            this.filteredInventoryLocations(me.inventoryItemList.items);
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
            fields: ['locationName', 'distance', 'available', 'orderedQty', 'reassignQty', 'blockAssignment'],
            groupField: 'locationName',
            data: me.inventoryItemList.items,
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
                    header: 'Location excluded',
                    dataIndex: 'blockAssignment',
                    flex: 1,
                    width: 50,
                    autoSizeColumn: true,
                    hidden: me.shipmentRecord.shipmentType != "STH",
                    //minWidth: 150,
                    renderer: function (val, meta, record) {
                        if (val)
                            return 'Y';
                        else
                            return 'N';
                    }
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
                    text: 'Qty to reassign', dataIndex: 'reassignQty', width: 150, allowBlank: false,
                    editor: {
                        xtype: 'textfield',
                        cls: 'x-grid-checkheader-editor',
                        inputValue: true,
                        regex: /^\d{0,9}$/,
                        regexText: "Invalid Number entered.",
                        uncheckedValue: false,
                        minValue: 1,
                        maxValue: me.selectedItem.quantity,
                        allowBlank: false,
                        validator: function (value) {
                            if (!isNaN(value)) {
                                if (value == 0) {
                                    return 'Quantity should not be 0';
                                }
                                Ext.getCmp('toolbar2').setVisible(false);
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
                store: 'ItemInventoryStore',
                dock: 'bottom',
                displayInfo: true,
                doRefresh: function () {
                    var store = Ext.getStore('ItemInventoryStore');
                    me.record.getInventory({
                        jsonData: me.getReassignItemPayload(),
                        success: function (response) {
                            me.isRecordSaved = true;
                            me.setLoading(false, me.body);
                            var json = Ext.decode(response.responseText, true);
                            inventorygrid.setLoading({
                                useMsg: false,
                                maskCls: 'x-mask taco-loadmask'
                            });
                            //store.loadData(json.items); 
                            store.proxy.data = json.items;
                            var current = store.currentPage;
                            if (me.fireEvent('beforechange', me, current) !== false) {
                                store.loadPage(current);
                            }
                            setTimeout(function () {
                                inventorygrid.setLoading(false);
                            }, 1000);
                        },
                        failure: function (response) {
                            me.setLoading(false, me.body);
                        }
                    });
                },
            }
            ],
            selModel: {
                selModel: 'rowmodel',
            },
            plugins: [this.cellEditing],
           
            listeners: {
                'validateedit': function (editor, context, eOpts) {
                    var me = this;
                    
                    Ext.getCmp('toolbar2').setVisible(false);

                    if (context.value == '') {
                        Ext.getCmp('toolbar2').setVisible(true);
                        return false;
                    }
                    else {
                        Ext.getCmp('toolbar2').setVisible(false);
                    }
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
            fields: ['name', 'code', 'orderedQty'],
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
                    width: 325,
                },
                {
                    text: 'Location Code',
                    dataIndex: 'code',
                    width: 325,
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
                        width: 425,
                        regex: /^\d{0,9}$/,
                        regexText: "Invalid Number entered.",
                        validator: function (value) {
                            if (!isNaN(value)) {
                                if (value == 0) {
                                    return 'Quantity should not be 0';
                                }
                                Ext.getCmp('toolbar2').setVisible(false);
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
            },
           
            ],
            selType: 'rowmodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1,
                    pluginId: 'cellEditing'
                })
            ],
            listeners: {
                'validateedit': function (editor, context, eOpts) {
                    var me = this;
                    Ext.getCmp('toolbar2').setVisible(false);

                    if (context.value == '') {
                        Ext.getCmp('toolbar2').setVisible(true);
                        return false;
                    }
                    else {
                        Ext.getCmp('toolbar2').setVisible(false);
                    }

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
            ],
            
        });

       
        this.items = [this.fieldContainer];
       
        this.callParent(arguments);

        this.addDocked(
            {
                xtype: 'toolbar',
                id: 'toolbar1',
                hidden: true,
                style: {
                    'top': '370px',
                    'color': 'red',
                    'font-size': '14px'
                },
                dock: 'bottom',
                layout: {
                    align: 'middle',
                    pack: 'start',
                    type: 'hbox',
                },
                items: [{
                    xtype: 'label',
                    text: 'Please select location and quantity to reassign',
                }],
            });
        this.addDocked({
            xtype: 'toolbar',
            id: 'toolbar2',
            hidden: true,
            style: {
                'top': '370px',
                'color': 'red',
                'font-size': '14px'
            },
            dock: 'bottom',
            layout: {
                align: 'middle',
                pack: 'start',
                type: 'hbox',
            },
            items: [{
                xtype: 'label',
                text: 'Please enter quantity to reassign',
            }],
        });
    },

    doSave: function () {
        var me = this;
        var grid = me.selectedTab == 'inventoryGrid' ? Ext.ComponentQuery.query('#inventoryGrid')[0]
            : Ext.ComponentQuery.query('#allLocationsGrid')[0];
        var item = grid.getSelectionModel().getSelection();
        
        if (item.length == 0 && this.count == 0) {
            this.count = this.count + 1;
            Ext.getCmp('toolbar1').setVisible(true);
        }
        
        if (this.validateModal()) {
            var me = this;
            me.setLoading(true);
            var payloadData = me.getPayloadDataItemInventory();

            this.record.reassignShipmentItems({
                jsonData: payloadData,
                success: function (response) {
                    me.isRecordSaved = true;
                    me.setLoading(false);
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
                    me.setLoading(false);
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
        if (item.length > 0) {
            Ext.getCmp('toolbar1').setVisible(false);
            var selectedItem = item[0].data;
            var rowIdx = grid.store.indexOf(item[0]);

            if (grid.itemId == 'allLocationsGrid') {
                if (selectedItem.name || selectedItem.locationName) {
                    var allocationgrid = Ext.ComponentQuery.query('#allLocationsGrid')[0];
                    var cellEditing = allocationgrid.getPlugin('cellEditing');

                    cellEditing.startEditByPosition({
                        row: rowIdx,
                        column: 3
                    });
                    if (selectedItem.reassignQty == null || selectedItem.reassignQty == '') {
                        Ext.getCmp('toolbar2').setVisible(true);
                        return false;
                    }
                    Ext.getCmp('toolbar2').setVisible(false);
                    return true;
                }
            }
            else if (grid.itemId == 'inventoryGrid' && selectedItem) {
                var allocationgrid = Ext.ComponentQuery.query('#inventoryGrid')[0];
                var cellEditing = allocationgrid.getPlugin('cellEditing');

                cellEditing.startEditByPosition({
                    row: rowIdx,
                    column: 4
                });
                if (selectedItem.reassignQty == null || selectedItem.reassignQty == '') {
                    Ext.getCmp('toolbar2').setVisible(true);
                    return false;
                }
                if (selectedItem.reassignQty > 0) {
                    Ext.getCmp('toolbar2').setVisible(false);
                    return true;
                }
            }
            return false;
        }
        Ext.getCmp('toolbar1').setVisible(true);
        Ext.getCmp('toolbar2').setVisible(false);
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

    getReassignItemPayload: function () {
        var me = this;

        var model = {
            type: me.shipmentRecord.shipmentType == "BOPIS" ? 'ALL' : 'ANY',
            items: []
        }

        if (me.shipmentRecord.location)
            model.locationBlacklist = [me.shipmentRecord.location.code];


        if (model && me.shipmentRecord.shipmentType == "BOPIS") {
            model.pickup = true;
        }
        else if (model && me.shipmentRecord.shipmentType == "STH") {
            model.directShip = true;
        }

        if (me.shipmentRecord.location && me.shipmentRecord.location.address) {
            model.requestLocation = {
                postalCode: me.shipmentRecord.location.address.postalOrZipCode,
                latitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lat : '',
                longitude: me.shipmentRecord.location.geo ? me.shipmentRecord.location.geo.lng : '',
                //locationCode: me.shipmentRecord.location.code,
                countryCode: me.shipmentRecord.location.address.countryCode
            }
            //only showing 500 miles radius locations for BOPIS
            if (model.requestLocation && me.shipmentRecord.shipmentType == "BOPIS") {
                model.requestLocation.radius = 500;
                model.requestLocation.unit = 'MILES';
            }
        }
        if (me.selectedItem) {
            model.items.push({
                //partNumber: item[0].data.productCode,
                upc: me.selectedItem.variationProductCode ? me.selectedItem.variationProductCode : me.selectedItem.productCode,//write condition if variationproduct code missing
                quantity: me.selectedItem.quantity
            });
        }
        return model;
    },

    

    
});
