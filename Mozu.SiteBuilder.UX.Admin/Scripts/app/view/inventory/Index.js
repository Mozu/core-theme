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
        'Taco.view.location.inventory.LocationInventory',
        'Taco.store.InventoriedProducts',
        'Taco.view.inventory.AdvancedSearchForm'
    ],

    typeName: 'Inventory',
    modelName: 'Taco.model.Product',
    store: {
        type: 'Taco.store.InventoriedProducts',
        createOnly:true
    },
    enableRowEditing: false,
    
    gridHeaderLabel: 'product',
    plural: false,
    

    contextConfig: {
        supportedLevels: ['m','c'],
        requiresContextOfType: ['m', 's', 'c']
    },
    
  
    useTilePanel: false,
    launchEditorOnClick: false,
    hasSidebar: false,
    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.product.AdvancedSearchForm'
    },
    
    


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
            advancedSearchConfig: this.advancedSearchConfig,
            isCollectionContext: Taco.app.context.getCurrent().contextType === "m",
            gridPanel: this.gridPanel,
            tilePanel: this.tilePanel,
            useGridPanel: this.useGridPanel,
            useTilePanel: this.useTilePanel
        });
    },

    gridPanelConf: {
        selModel: {
            selType: 'rowmodel',
            checkOnly: true,
            showHeaderCheckbox: false,
            ignoreRightMouseSelection: false,
            headerWidth: 37
        },
        viewConfig: {
            deferEmptyText: false,
            emptyText: "No products to display."
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
                renderer: function (value, metaData, record) {
                    var name = record.getContextualValue('productName');;
                    if (record.get('productUsage') == 'Configurable') {
                        name += ' <br>(' + Ext.Array.pluck(record.get('variationOptions'), 'value').join() + ')';
                    }


                    return name;
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
                        locationList.store.extraFilters.removeAtKey("productCode");
                        locationList.store.removeAll();
                        return;
                    }
                    
                    productCode = record.get("productCode");
                    
                    locationList.store.extraFilters.add({ id: "productCode", property: 'productCode', value: productCode });
                    locationList.defaultRowEditingData = {
                        productCode: productCode
                    };

                    locationList.store.load();

                }
            }
        }
    },

    initComponent: function() {
        var me = this;
        
        this.header =  {
            actions: [{
                xtype: 'primarybutton',
                itemId: 'createActionButton',
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
        
        
        // auto select the first record in the grid so the location grid can get loaded;
        me.mon(this.store,'load', function (store, records, success, eOpts) {            
            if (records && records.length) {
                    this.gridPanel.selModel.select(records[0], false);
                }
            }, this, {
   //             single: true
            }
        );
    }
});