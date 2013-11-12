/**
 * @class Taco.view.inventory.Index
 */
Ext.define('Taco.view.inventory.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.inventoryindex',
    requires: [
        'Taco.model.Product', 
        'Taco.store.Products', 
        'Taco.model.LocationInventory', 
        'Taco.store.LocationInventories', 
        'Ext.grid.plugin.CellEditing', 
        'Taco.view.inventory.QuantityEdit',
        'Taco.view.location.inventory.LocationInventory'
    ],

    typeName: 'Inventory',
    modelName: 'Taco.model.Product',
    store: {
        type: 'Taco.store.Products',
        createOnly:true
    },
    
    
    gridHeaderLabel: 'product',
    plural: false,
    

    requiresContextOfType: ['c', 's'],
    useTilePanel: false,
    launchEditorOnClick: false,
    hasSidebar:false,
    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form orders',
        items: [{
            xtype: 'container',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [
                {
                    name: 'productName',
                    fieldLabel: 'Product Name',
                    flex: 1

                }, {
                    name: 'productCode',
                    fieldLabel: 'Product Code',
                    flex: 1
                }
            ]
        }]
    },

    filterProperties: [
        {
            property: 'all',
            text: 'All',
            isDefault: true
        },
        {
            name: 'productName',
            text: 'Product Name'
        },
        {
            name: 'productCode',
            text: 'Product Code'
        }
    ],
    

    layoutItemBrowser: function () {
        
        var me = this;

        this.createLocationBrowser();

        Ext.apply(this.itemBrowser, {
            region: "west",
            split: true,
            width: 350
        });

        Ext.apply(this.body, {
            layout: { type: 'border' },
            items: [
                this.itemBrowser,
                this.locationList
            ]
        });
    },

    createLocationBrowser: function () {
        var me = this;        
        
        this.locationList = Ext.create('Taco.view.location.inventory.LocationInventory', {
            region: "center",
            enableSearch: true,
            showProductColumns: false,
            showLocationColumns: true,
            secondToolbarItems: [],
            viewConfig: {
                deferEmptyText: false,
                emptyText: "No inventory at this location."
            }
        });
    },

    createItemBrowser: function (conf) {

        this.itemBrowser = Ext.create('Taco.core.ux.browser.ItemBrowser', {
            itemStore: this.store,
            secondToolbarItems: this.secondToolbarItems,
            options: this.options,
            itemType: this.token,
            typeName: this.typeName,
            gridHeaderLabel: this.gridHeaderLabel,
            filterFormConf: this.filterFormConf,
            filterProperties: this.filterProperties,
            isCollectionContext: Taco.app.context.getCurrent().contextType === "c",
            gridPanel: this.gridPanel,
            tilePanel: this.tilePanel,
            useGridPanel: this.useGridPanel,
            useTilePanel: this.useTilePanel
        });

        if (this.record && this.record.isModel) {
            this.on({
                afterrender: function () {
                    this.launchLoadedEditor(this.record);
                },
                scope: this
            });
        }
    },

    gridPanelConf: {
        selModel: {
            selType: 'rowmodel',
            checkOnly: true,
            showHeaderCheckbox: false,
            ignoreRightMouseSelection: false,
            headerWidth: 37
        },
        columns: [
            {
                dataIndex: 'productCode',
                text: 'Code',
                width: 140
            }, {
                dataIndex: 'productName',
                text: 'Name',
                minWidth: 120,
                resizable: false,
                flex: 1,
                renderer: function(value, metaData, record) {
                    return record.getContextualValue('productName');
                }
            }
        ],
        listeners: {
            selectionchange: {
                fn: function (selModel, selected, eOpts) {
                    var grid = selModel.view,
                        browserPage = grid.up('browserpage'),
                        locationList = browserPage.locationList,
                        record = selected[0],
                        productCode = "";
                    
                    if (!record) {
                        return;
                    }
                    
                    productCode = record.get("productCode");
                    
                    locationList.store.clearFilter(true);
                    locationList.store.filter({ property: 'productCode', value: productCode });
                    locationList.defaultRowEditingData = {
                        productCode: productCode
                    };
                }
            }
        }
    },

    initComponent: function() {
        var me = this;
        
        this.header =  {
            actions: [{
                xtype: 'primarybutton',
                itemId: 'newbutton',
                hidden: !this.allowCreate(),
                listeners: {
                    click: function () {
                            this.locationList.onRowEditorCreate();
                    },
                    scope: this
                }
            }]
        };
        
        this.callParent(arguments);
        
        this.store.on('dirtychange', function (store, state) {
            me.dirtyButton.setDirty(state);
        });
    }
});