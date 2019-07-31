Ext.define('Taco.view.order.modal.fulfillment.ItemsReassign', {
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
    title: 'Items Reassign',
    isRecordSaved: false,
    layout: {
        type: 'fit'
    },

    initComponent: function () {
        var me = this;
        var itemsPerPage = 2;
        var inventoryStore = Ext.create('Ext.data.Store', {
            storeId: 'simpsonsStore',
            autoLoad: false,
            //autoLoad: { start: 0, limit: 5 },
            pageSize: itemsPerPage,
            remoteSort: true,
            sorters: [{
                property: 'location',
                direction: 'asc'
            }],
            fields: ['location', 'distance', 'stock'],
            groupField: 'location',
            data: this.inventoryItemData.candidateSuggestions,
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

        var inventorygrid = Ext.create('Ext.grid.Panel', {
            title: 'Inventory',
            //features: [{
            //    ftype: 'grouping'
            //}],

            store: Ext.data.StoreManager.lookup('simpsonsStore'),
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
                    header: 'Location',
                    dataIndex: 'location',
                    width: 200,
                },
                { header: 'Distance', dataIndex: 'distance', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150 },
                { text: 'Available', dataIndex: 'availableQty', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150 },
                { text: 'Qty Ordered', dataIndex: 'orderedQty', flex: 1, width: 50, autoSizeColumn: true, minWidth: 150 },
                {
                    text: 'Qty to reassign', dataIndex: 'reassignQty', width: 150,
                    editor: {
                        xtype: 'textfield',
                        cls: 'x-grid-checkheader-editor',
                        inputValue: true,
                        uncheckedValue: false
                    }
                },
            ],
            height: 500,
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
            listeners: {
                selectionchange: function () {
                },
                select: function () {
                },
                deselect: function () {
                },
                //beforeload: function (store, operation, eOpts) {
                //    store.proxy.data = inventoryData;
                //}
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
            //store: Ext.data.StoreManager.lookup('allLocationsStore'),
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
            height: 500,
            renderTo: Ext.getBody(),
            items: [
                inventorygrid,
                allLocations
            ]
        });

        this.items = [this.fieldContainer];

        this.callParent(arguments);

    },

    //validateModal: function () {
    //    //verify quantity is not null and less than 0 and should not be greater than max quantity
    //    var quantity = this.down('#cancelQuantity').getValue();

    //    if (!quantity || quantity <= 0 || quantity > (this.originalQuantity || this.record.data.quantity))
    //        return false;

    //    //verify cancel reason should be filled
    //    var reason = (this.down('#cancelReason').getValue() === 'Other'
    //        ? this.down('#otherReason').getValue()
    //        : this.down('#cancelReason').getValue());

    //    if (!reason)
    //        return false;

    //    return true;
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
