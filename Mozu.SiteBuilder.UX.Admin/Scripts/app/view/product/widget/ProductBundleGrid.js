/**
 * @class Taco.view.product.widget.ProductBundleGrid
 */
Ext.define('Taco.view.product.widget.ProductBundleGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.productbundlegrid',
    requires: [
        'Ext.form.field.Number',
        'Ext.grid.plugin.DragDrop',
        'Ext.data.Store',
        'Ext.grid.plugin.CellEditing',
        'Taco.store.Products',
        'Taco.model.BundledProduct',
        'Taco.view.product.Modal',
        'Taco.store.ProductBundlePicker'
    ],
    title: "",
    //cls: Taco.baseCSSPrefix + 'searchlist',
    enableSearch: false,
    enablePaging: false,
    enableRowEditing: false,
    enableAutoSelect:false,
    launchEditorOnClick: true,
    modelName: 'Taco.model.Product',
    hideSearchToolbar: true,
    isReadOnly: false,
    isGlobal: false,
    bundleProductSource: null,
    //selType: 'cellmodel',
    width: "100%",

    initComponent: function () {
        var me = this;        
        
        Ext.apply(me, {
            selModel: Ext.create('Ext.selection.CellModel', {
                enableFieldTabbing: true
                //    enableKeyNav: false // to disable cell traversal when clicks on keys(es: TAB) 
            }),
            viewConfig: {
                deferEmptyText: false,
                emptyText: "No items in this bundle",
                stripeRows: false,
                plugins: [
                    {
                        ptype: 'gridviewdragdrop'
                    }
                ]
            },
            listeners: {                
                'edit': {
                    fn: function(editor, column) {
                        column.record.commit();                        
                        column.record.save();
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

        this.store = this.bundleProductSource.getBundledProducts();

        this.callParent(arguments);

        this.mon(this.view, 'drop', function (node, data) {
            // need top set a model member to dirty the record so that the store will persist the change; the value you set isn't persisted;
            data.records[0].set('index', 1);
        }, this);

        // hook up events only for catalog tabs to listen to global tab
        if (this.isGlobal) return;

        this.mon(Taco.app, 'bundle-items-added', this.onBundleItemsAdded, this);
        this.mon(Taco.app, 'bundle-item-quantity-changed', this.onBundleItemQuantityChanged, this);
        this.mon(Taco.app, 'bundle-item-removed', this.onBundleItemRemoved, this);
    },

    onBundleItemsAdded: function (bundleItems) {
        var me = this,
            catalogId,
            catWarnings = [],
            catName,
            warningMsg;
        if (this.isGlobal) return;

        catalogId = this.productInCatalogInfo.get('catalogId');
        //have to check cat id?
        Ext.Array.each(bundleItems, function (bundleItem) {
            var match = Ext.Array.findBy(bundleItem.get('productInCatalogs'), function(prodInCatalog){
                return prodInCatalog.catalogId === catalogId;
            });
            if (!match) {
              catWarnings.push(bundleItem.get('productName'));
              return;
            }
            var mergedBundleItem = Ext.Object.merge(bundleItem.data, {price: match.price, salePrice: match.salePrice, productName: match.productName });
            me.store.add(mergedBundleItem);
        });
        // to signal to refresh totals since AJAX call takes longer.
        Taco.app.fireEvent('bundle-item-catalog-added', bundleItems);
        this.getView().refresh();
        if (catWarnings.length > 0) {
            catName = this.productInCatalogInfo.get('catalog').name;
            warningMsg = 'Warning: ';
            if (catWarnings.length === 1) {
              warningMsg += ('"' + catWarnings[0] + '" is');
            } else {
              warningMsg += ('These bundle items, "' + catWarnings.join('", "') + '" are');
            }
            warningMsg += (' not active in "' + catName + '"');
            Taco.app.fireEvent('setmessage', warningMsg, 'error');
        }
    },
    onBundleItemQuantityChanged: function (masterCatBundleItem) {
        if (this.isGlobal) return;
        var bundleItem = this.store.findRecord('productCode', masterCatBundleItem.get('productCode'));
        if (!bundleItem) return;
        bundleItem.set('quantity', masterCatBundleItem.get('quantity'));
        this.getView().refresh();
    },

    onBundleItemRemoved: function (masterCatBundleItem) {
      if (this.isGlobal) return;
      var bundleItem = this.store.findRecord('productCode', masterCatBundleItem.get('productCode'));
      if (!bundleItem) return;
      this.store.remove(bundleItem);
      this.getView().refresh();
    },
    
    getColumnConfig: function () {
        var me = this,
          columns,
          qtyEditor = null;
        if (!this.isReadOnly) {
            qtyEditor = {
                // defaults to textfield if no xtype is supplied
                xtype: "numberfield",
                showBorder:true,
                hideTrigger: true,
                mouseWheelEnabled: false,
                emptyText: "quantity",
                msgTarget: "qtip",
                // optional enhancement to rowEditor. Makes the field only editable during a create;
                //editableOnCreateOnly: true,
                selectOnFocus: true,
                allowBlank: false
            };
        }

        columns = [
            {
                dataIndex: "quantity",
                text: "Quantity",
                stateId:"quantity",
                sortable: false,
                resizable: true,
                menuDisabled: true,
                editor: qtyEditor,
                width: 100
            },
            {
                dataIndex: 'productCode',
                sortable: false,
                stateId: "productCode",
                resizable: true,
                menuDisabled: true,
                text: 'Code',
                width: 150
            }, {
                dataIndex: 'productName',
                sortable: false,
                stateId: "productName",
                resizable: true,
                menuDisabled: true,
                text: 'Name',
                flex: 1
            }, {
                dataIndex: 'price',
                stateId: "price",
                renderer: function (value) {
                    return me.product.formatCurrency(value);
                },
                sortable: false,
                resizable: true,
                menuDisabled: true,
                width: 150,
                text: (!me.isGlobal ? 'Catalog ' : '') + 'Price'
            }, {
                dataIndex: 'salePrice',
                stateId: "salePrice",
                renderer: function (value) {
                    return value !== null ? me.product.formatCurrency(value) : '';
                },
                sortable: false,
                resizable: true,
                menuDisabled: true,
                width: 150,
                text: (!me.isGlobal ? 'Catalog ' : '') + 'Sale Price'
            }
        ];

        if (!this.isReadOnly) {
            columns.push({
                xtype: 'taco.menucolumn',
                draggable: false,
                menuDisabled: true,
                text: '',
                iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger-remove',
                menuItems: [],
                handler: function(grid, rowIndex, colIndex, header, e, record) {
                // tell the method that we we want to move this item back to the unshippedItems list;
                    me.removeItem(record);
                },
                scope: me
            });
        }

        return columns;
    },

    /**
    *  Open the product selector dialog, in order to add a product or bundle item;
    */
    addItem: function () {
        var me = this,
            productStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductBundlePicker');

        if (!productStore.hasLoaded()) {
            productStore.load();
        }
        
        var productSelector = Ext.create('Taco.view.product.Modal', {
            store: productStore,
            listeners: {
                savesuccess: {
                    fn: function (modal, values) {
                        
                        // add a default quantity of 1 to each selected record
                        var bundleStore = this.store;
                        var itemsToAdd = [];


                        Ext.Array.each(values, function (record) {
                            
                            var item = Ext.create('Taco.model.BundledProduct', record.data);
                            item.set('quantity', 1);
                            // need to manually set the dirtystate on new records because they automatically get an id which ext uses to determine if there is a phantom (ie dirty);
                            item.setDirty();
                            
                            itemsToAdd.push(item);

                            //remove any records from the store that match what we just added;
                            var existingRecord = bundleStore.getById(record.get("productCode"));
                            if (existingRecord) {
                                bundleStore.remove(existingRecord);
                            }
                        });

                        bundleStore.add(itemsToAdd);
                      // fire itemsToAdd ??
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
