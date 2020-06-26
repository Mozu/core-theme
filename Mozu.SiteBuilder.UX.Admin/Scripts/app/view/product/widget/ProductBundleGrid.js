/**
 * @class Taco.view.product.widget.ProductBundleGrid
 */
Ext.define('Taco.view.product.widget.ProductBundleGrid', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.productbundlegrid',
    requires: [
        'Ext.form.field.Number',
        'Ext.grid.plugin.DragDrop',
        'Taco.core.ux.DragHandleColumn',
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
    enableRowReorder: true,
    enableAutoSelect:false,
    launchEditorOnClick: false,
    modelName: 'Taco.model.Product',
    hideSearchToolbar: true,
    isReadOnly: false,
    isGlobal: false,
    bundleProductSource: null,
    width: "100%",
    viewConfig: {
        deferEmptyText: false,
        emptyText: Localizer.langResources.CATALOG.Products.ProductEdit.no_items_in_this_bundle,
        stripeRows: false,
        plugins: {
            ptype: 'gridviewdragdrop',
            ddGroup: 'dd',
            dragGroup: 'dd',
            dropGroup: 'dd'
        }
    },
    plugins: [
        {
            ptype: 'cellediting',
            clicksToEdit: 1
        }, {
            ptype: 'classhandleddragdrop'
        }
    ],

    initComponent: function () {

        this.viewConfig = this.viewConfig || {};
        this.columns = this.getColumnConfig();
        this.store = this.bundleProductSource.getBundledProducts();
        this.callParent(arguments);

        if (this.isGlobal) {
            this.mon(this.view, 'drop', function (node, data) {
                // need top set a model member to dirty the record so that the store will persist the change; the value you set isn't persisted;
                data.records[0].set('index', 1);
            }, this);

            this.mon(this.view, 'edit', function (editor, column) {
                column.record.commit();
                column.record.save();
            }, this);
        } else {
            // hook up events only for catalog tabs to subscribe to global tab events
            this.mon(Taco.app, 'bundle-items-added', this.onBundleItemsAdded, this);
            this.mon(Taco.app, 'bundle-item-quantity-changed', this.onBundleItemQuantityChanged, this);
            this.mon(Taco.app, 'bundle-item-removed', this.onBundleItemRemoved, this);
        }
    },

    /// Handled normal adds and drag/drop, which results in a remove and an add
    /// It will verify if the sequence order matches.
    onBundleItemsAdded: function (bundleItems) {
        var me = this,
            isSameSequence,
            catBundleItems,
            catBundleItemCodes,
            mergedBundleItems,
            mcBundledItems = me.product.get('bundledProducts'),
            resequencedCatItems = [];
        if (this.isGlobal) return;

        mergedBundleItems = this.mergeBundleItemWithProductCatalogInfoOverrides(bundleItems);
        catBundleItems = me.store.getRange().concat(mergedBundleItems.result);
        catBundleItemCodes = Ext.Array.map(catBundleItems, function(item){
            return item.productCode || item.get('productCode');
        });
        isSameSequence = this.doesSequenceMatchMasterCatalog(mcBundledItems, catBundleItemCodes);
        if (isSameSequence) {
            Ext.Array.each(mergedBundleItems.result, function(mergedBundleItem) {
                me.store.add(mergedBundleItem);
            });
        } else {
            Ext.Array.forEach(mcBundledItems, function (mcBundleItem) {
                var catItem = Ext.Array.findBy(catBundleItems, function(item) {
                    return (item.productCode || item.get('productCode')) === mcBundleItem.productCode;
                });
                if (catItem) {
                    resequencedCatItems.push(catItem);
                }
            });
            this.store.removeAll(true);
            this.store.add(resequencedCatItems);
        }
        Taco.app.fireEvent('bundle-item-catalog-sync', bundleItems);
        this.getView().refresh();
        this.warnInactiveBundleItemsInCatalog(mergedBundleItems.warnings);
    },

    onBundleItemQuantityChanged: function (masterCatBundleItem) {
        if (this.isGlobal) return;
        var bundleItem = this.store.findRecord('productCode', masterCatBundleItem.get('productCode'));
        if (!bundleItem) return;
        bundleItem.set('quantity', masterCatBundleItem.get('quantity'));
        Taco.app.fireEvent('bundle-item-catalog-sync', bundleItem);
        this.getView().refresh();
    },

    onBundleItemRemoved: function (masterCatBundleItem) {
        if (this.isGlobal) return;
        var bundleItem = this.store.findRecord('productCode', masterCatBundleItem.get('productCode'));
        if (!bundleItem) return;
        this.store.remove(bundleItem);
        Taco.app.fireEvent('bundle-item-catalog-sync', bundleItem);
        this.getView().refresh();
    },

    mergeBundleItemWithProductCatalogInfoOverrides: function (bundleItems) {
        var newMergedBundleItems = [],
          catWarnings = [],
          catalogId = this.productInCatalogInfo.get('catalogId');

        Ext.Array.each(bundleItems, function (bundleItem) {
            var match = Ext.Array.findBy(bundleItem.get('productInCatalogs'), function (prodInCatalog) {
                return prodInCatalog.catalogId === catalogId;
            });
            if (!match) {
                catWarnings.push(bundleItem.get('productName'));
                return;
            }
            var mergedBundleItem = Ext.Object.merge(bundleItem.data, {
                price: match.price,
                salePrice: match.salePrice,
                productName: match.productName
            });
            newMergedBundleItems.push(mergedBundleItem);
        });
        return {
            result: newMergedBundleItems,
            warnings: catWarnings
        };
    },

    // pseudo code to compare sequence order:
    // for loop mcArray
    //  if item1 !== item2
    //    if (contains(item1))
    //      isSameSequence = false
    //      break;
    //    else
    //      insert into catArray
    // return isSameSequence
    doesSequenceMatchMasterCatalog: function (mcBundledItems, catBundleItemCodes) {
        var i,
            isSameSequence = true;
        for (i = 0; i < mcBundledItems.length; i++) {
            if (i >= catBundleItemCodes.length) {
                //if happens then should be in order up to then. Therefore others would not exist in catalog
                break;
            }
            if (mcBundledItems[i].productCode !== catBundleItemCodes[i]) {
                if (Ext.Array.contains(catBundleItemCodes, mcBundledItems[i].productCode)) {
                    isSameSequence = false;
                    break;
                } else {
                    // add placeholder to match up indexes.
                    Ext.Array.insert(catBundleItemCodes, i, mcBundledItems[i].productCode);
                }
            }
        }
        return isSameSequence;
    },

    warnInactiveBundleItemsInCatalog: function (catWarnings) {
        var catName, warningMsg;
        if (catWarnings.length > 0) {
            catName = this.productInCatalogInfo.get('catalog').name;
            warningMsg = Localizer.langResources.CATALOG.Products.ProductEdit.warning +': ';
            if (catWarnings.length === 1) {
                warningMsg += ('"' + catWarnings[0] + '" ' + Localizer.langResources.CATALOG.Products.ProductEdit.is + '');
            } else {
                warningMsg += (Localizer.langResources.CATALOG.Products.ProductEdit.these_bundle_items + ', "' + catWarnings.join('", "') + '" ' + Localizer.langResources.CATALOG.Products.ProductEdit.are + '');
            }
            warningMsg += (' ' + Localizer.langResources.CATALOG.Products.ProductEdit.not_active_in + '"' + catName + '"');
            Taco.app.fireEvent('setmessage', warningMsg, 'error');
        }
    },

    getColumnConfig: function () {
        var me = this,
          columns = [],
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
        if (!this.isReadOnly) {
            columns.push({
                xtype: 'draghandlecolumn',
                stateId: 'dragHandle',
                width: 35,
                hideable: false
            });
        }

        columns = Ext.Array.push(columns, [
            {
                dataIndex: "quantity",
                text: Localizer.langResources.CATALOG.Products.ProductEdit.quantity,
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
                text: Localizer.langResources.CATALOG.Products.ProductEdit.code,
                width: 150
            }, {
                dataIndex: 'productName',
                sortable: false,
                stateId: "productName",
                resizable: true,
                menuDisabled: true,
                text: Localizer.langResources.CATALOG.Products.ProductEdit.name,
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
                text: (!me.isGlobal ? Localizer.langResources.CATALOG.Products.ProductEdit.catalog + ' ' : '') + Localizer.langResources.CATALOG.Products.ProductEdit.price
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
                text: (!me.isGlobal ? Localizer.langResources.CATALOG.Products.ProductEdit.catalog + ' ' : '') + Localizer.langResources.CATALOG.Products.ProductEdit.sale_price
            }
        ]);

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
            title: Localizer.langResources.CATALOG.Products.ProductEdit.remove_item,
            rightJustifyButtons: true,
            reverseOrder: true,
            msg: Localizer.langResources.CATALOG.Products.ProductEdit.remove_this_item_msg,
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {
                    me.store.remove(record);
                    me.store.sync();
                }
            }
        });
    },
    refresh: function() {
        this.getView().refresh();
    }
});
