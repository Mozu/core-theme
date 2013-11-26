/**
 * @class Taco.view.product.widget.ProductBundleGrid
 */
Ext.define('Taco.view.product.widget.ProductBundleGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.productbundlegrid',
    requires: [
        'Ext.data.Store',
        'Ext.grid.plugin.CellEditing',
        'Taco.model.BundledProduct',
        'Taco.view.product.Modal'
    ],
    title: "",
    //cls: Taco.baseCSSPrefix + 'searchlist',
    enableSearch: false,
    enablePaging: false,
    enableRowEditing: false,
    hideSearchToolbar: true,
    selType: 'cellmodel',
    width: "100%",

    initComponent: function () {
        var me = this;        
        

        Ext.apply(me, {
            viewConfig: {
                deferEmptyText: false,
                emptyText: "No items in this bundle",
                plugins: [
                    { ptype: 'gridviewdragdrop' }
                ]
            },
            listeners: {
                'edit': {
                    fn: function(editor, column, e) {
                        column.record.commit();
                    }
                }
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 1
                })
            ],
            columns: this.getColumnConfig()
        });
        
        this.store = this.product.getBundledProducts();

        this.callParent(arguments);
    },
    
    getColumnConfig: function () {
        var me = this;
        
        return [
            {
                dataIndex: "quantity",
                text: "Quantity",
                sortable: false,
                resizable: false,
                menuDisabled: true,
                editor: {
                    // defaults to textfield if no xtype is supplied
                    xtype: "numberfield",
                    hideTrigger: true,
                    mouseWheelEnabled: false,
                    emptyText: "quantity",
                    msgTarget: "qtip",
                    // optional enhancement to rowEditor. Makes the field only editable during a create;
                    //editableOnCreateOnly: true,
                    selectOnFocus: true,
                    allowBlank: false
                },
                width: 100
            },
            {
                dataIndex: 'productCode',
                sortable: false,
                resizable: false,
                menuDisabled: true,
                text: 'Code',
                width: 100
            }, {
                dataIndex: 'productName',
                sortable: false,
                resizable: false,
                menuDisabled: true,
                text: 'Name',
                flex: 1
            }, {
                dataIndex: 'price',
                renderer: Ext.util.Format.usMoney,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                text: 'Price'
            }, {
                dataIndex: 'salePrice',
                renderer: Ext.util.Format.usMoney,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                width: 100,
                text: 'Sale Price'
            }, {
                xtype: 'taco.menucolumn',
                draggable: false,
                menuDisabled: true,
                text: '',
                width: 40,
                iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger ' + Taco.baseCSSPrefix + 'grid-row-menu-trigger-remove',
                menuItems: [],
                handler: function(grid, rowIndex, colIndex, header, e, record, item) {
                    // tell the method that we we want to move this item back to the unshippedItems list;
                    me.removeItem(record);
                },
                scope: me
            }
        ];
    },

    /**
    *  Open the product selector dialog, in order to add a product or bundle item;
    */
    addItem: function () {
        var me = this,
            productStore = Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Products',
                storeId: "bundleableProducts",
                createOnly: true,
                clearFilters: true,
                clearSort: true,
                autoLoad: false
            });
        
        
        /*
        productStore.extraFilters.add(
            { id: "productUsage", property: 'productUsage', operator: "=", value: ["Standard ", "Component"] }
            //{ id: "productUsage", property: 'productUsage', operator: "=", value: "Standard" }
        );
        */
        
        
        
        productStore.load();

        
        var productSelector = Ext.create('Taco.view.product.Modal', {
            store: productStore,
            listeners: {
                save: {
                    fn: function (modal, values) {
                        // add a default quantity of 1 to each selected record
                        var bundleStore = this.store;
                        var itemsToAdd = [];


                        Ext.Array.each(values, function (record) {
                            
                            var item = Ext.create('Taco.model.BundledProduct', record.data);
                            item.set('quantity', 1);
                            itemsToAdd.push(item);

                            //remove any records from the store that match what we just added;
                            var existingRecord = bundleStore.getById(record.get("productCode"));
                            if (existingRecord) {
                                bundleStore.remove(existingRecord);
                            }
                        });

                        bundleStore.add(itemsToAdd);
                    },
                    scope: me
                }
            }
        });
        
    },

    /**
    *  Remove a bundle itme from the grid;
    */
    removeItem: function (record) {
        var me = this;
        
        Ext.MessageBox.show({
            title: 'Remove Item',
            rightJustifyButtons: true,
            reverseOrder: true,
            msg: 'Are you sure you want to remove this item?',
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {
                    me.store.remove(record);
                    me.store.sync();
                }
            }
        });
    }
});
