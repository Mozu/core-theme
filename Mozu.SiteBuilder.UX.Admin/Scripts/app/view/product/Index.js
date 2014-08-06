/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.product.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.prodindex',
    requires: [
        'Taco.model.Product',
        'Taco.store.Products',
        'Taco.view.product.AdvancedSearchForm',
        'Taco.store.ProductGrid'

    ],

    typeName: 'Product',
    modelName: 'Taco.model.Product',
    store: {
        type: 'Taco.store.ProductGrid'
    },
    editorName: 'Taco.view.product.Edit',
    filterProperty: 'productName2',
    useTilePanel: false,

    reFetchRecordOnEdit: true,
    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 'c', 's']
    },


    gridPanelConf: {
        columns: [{
                dataIndex: 'productCode',
                text: 'Code',
                width: 100
            }, {
                dataIndex: 'productName',
                text: 'Name',
                minWidth: 120,
                flex: 1,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('productName');

                }
            }, {
                dataIndex: 'price',
                text: 'Price',


                width: 70,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('price', true) || '--';

                }
            }, {
                dataIndex: 'salePrice',
                text: 'Sale Price',
                width: 100,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('salePrice', true) || '--';
                }
            }, {
                dataIndex: 'productInCatalogs',
                text: 'Catalogs',
                sortable: false,
                width: 120,
                renderer: function (value) {
                    return !Ext.isEmpty(value) ? value.length : '--';
                }
            }, {
                dataIndex: 'productInCatalogs',
                text: 'Overridden',
                sortable: false,
                width: 100,
                renderer: function (value) {
                    var output;

                    if (Ext.isEmpty(value)) {
                        output = '--';
                    } else {
                        output = Ext.Array.contains(Ext.Array.pluck(value, 'isContentOverridden'), true) ? 'Yes' : 'No';
                    }

                    return output;
                }
            }, {
                dataIndex: "lastModifiedDate",
                xtype: 'datecolumn',
                format: 'Y-m-d',
                text: 'Last Modified',
                hidden: true
            },
            {
                dataIndex: "productTypeId",
                text: 'Product Type',
                hidden: true,
                sortable: false,
                renderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
                    view.productTypeStore = view.productTypeStore || Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes');
                    var ptRecord = view.productTypeStore.getById(value);
                    return ptRecord ? ptRecord.data.name : '';
                }
             },
            {
                dataIndex: "productUsage",
                text: 'Product usage',
                hidden: true,
                sortable: false

            },
            {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                menuItems: [{
                    itemId: 'live',
                    text: 'View Live',
                    hideOnClick: false,
                    menu: {
                        plain: true,
                        shadow: false,
                        cls: Taco.baseCSSPrefix + 'grid-row-menu',
                        items: []
                    }
                }, {
                    itemId: 'preview',
                    text: 'View Staged',
                    hideOnClick: false,
                    menu: {
                        plain: true,
                        shadow: false,
                        cls: Taco.baseCSSPrefix + 'grid-row-menu',
                        items: []
                    }
                    }, {
                    text: 'Delete',
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'destroy'
                    },
                    menuColumnHandler: 'destroyMenuColumnHandler'
                    }, {
                    text: 'Edit',
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'update'
                    },
                    menuColumnHandler: function (item, eventData) {
                        var page = eventData.grid.getParentPage(),
                            record = eventData.record,
                            metaData = {
                                id: record.getId()
                            };

                        page.launchEditor(record, metaData);

                    }
                    }],
                onMenuShow: function (menu, eventData) {
                    var previewAction = menu.items.get('preview'),
                        liveAction = menu.items.get('live'),
                        defaults = eventData.header.menuItemDefaults;

                    previewAction.menu.removeAll();
                    liveAction.menu.removeAll();
                    eventData.record.productInCatalogsStore().each(function (record) {
                        var sites = record.get('sites');
                        Ext.each(sites, function (site) {
                            if (site.isMozuRendered) {
                                previewAction.menu.add(Ext.applyIf({
                                    text: site.name,
                                    menuColumnHandler: function (item, eventData) {
                                        window.open('/_gosite/' + site.id + '?environment=preview&redir=' + encodeURIComponent('/p/' + eventData.record.getId()), 'taco-preview');
                                    }
                                }, defaults));

                                liveAction.menu.add(Ext.applyIf({
                                    text: site.name,
                                    menuColumnHandler: function (item, eventData) {
                                        window.open('/_gosite/' + site.id + '?environment=live&redir=' + encodeURIComponent('/p/' + eventData.record.getId()), 'taco-preview');
                                    }
                                }, defaults));
                            }
                        });
                    });
                    previewAction.setVisible(eventData.record.productInCatalogsStore().count());
                }
            }],
        contextConf: {
            m: {
                useMultiGrid: true,
                plugins: ['autoselect', {
                    ptype: 'rowexpander',
                    pluginId: 'expander',
                    rowBodyTpl: new Ext.XTemplate(
                        '<tpl for="productInCatalogs"><tr class="x-grid-row-body">',
                        '<td colspan="2" class="x-grid-subcell"><div class="x-grid-cell-inner"></div></td>',
                        '<td class="x-grid-subcell"><div class="x-grid-cell-inner"><a href="#" class="taco-launch-editor" data-catalog-id="{catalogId}">{productName}</a></div></td>',
                        '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{[this.formatPrice(values.price,values.catalogId)]}</div></td>',
                        '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{[this.formatPrice(values.salePricem,values.catalogId)]}</div></td>',
                        '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{catalogId:this.toCatalogName}</div></td>',
                        '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{isContentOverridden:this.formatOverridden}</div></td>',
                        '<td class="x-grid-subcell"><div class="x-grid-cell-inner"></div></td>',
                        '</tr></tpl>', {
                            formatOverridden: function (value) {
                                return value ? '<span class="overridden">Overridden</span>' : '';
                            },
                            formatPrice: function (value, catalog) {
                                return (value || value === 0) ? Taco.app.context.findCatalog(catalog).formatCurrency(value) : '--';
                            },
                            toCatalogName: function (value) {
                                var catalog = Taco.app.context.findCatalog(value);
                                return catalog ? catalog.name : 'n/a';
                            }
                        })
                }]
            }
        }
    },

    bulkEditorColumns: [{
        dataIndex: 'productCode',
        text: 'Code',
        width: 100
        }, {
        dataIndex: 'productName',
        text: 'Name',
        minWidth: 120,
        flex: 1,
        editor: {
            xtype: 'textfield'
        }
        }, {
        dataIndex: 'price',
        text: 'Price',
        width: 100,
        renderer: function (value, metaData, record) {
            return (value || value === 0) ? record.formatCurrency(value) : '--';
        },
        editor: {
            xtype: 'currencyfield',
            minValue: 0,
            decimalPrecision: 2,
            hideTrigger: true,
            keyNavEnabled: false,
            mouseWheelEnabled: false
        }
        }, {
        dataIndex: 'salePrice',
        text: 'Sale Price',
        width: 100,
        renderer: function (value, metaData, record) {
            return (value || value === 0) ? record.formatCurrency(value) : '--';
        },
        editor: {
            xtype: 'currencyfield',
            minValue: 0,
            decimalPrecision: 2,
            hideTrigger: true,
            keyNavEnabled: false,
            mouseWheelEnabled: false
        }
        }],

    tilePanelConf: {
        actions: [{
            iconCls: 'download',
            tooltip: 'View Product',
            eventName: 'viewitem'
            }, {
            iconCls: 'duplicate',
            tooltip: 'Duplicate Product',
            eventName: 'duplicateitem'
            }, {
            iconCls: 'delete',
            tooltip: 'Delete Product',
            eventName: 'deleteitem'
            }],
        imageCollection: 'productImages',
        imageField: 'imagePath',
        isDragable: false,
        nameField: 'productName'
    },

    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.product.AdvancedSearchForm'
    },


    /*
    initComponent: function() {
        var me = this;
        me.header = {
            title: 'Products',
            actions: [{
                xtype: 'primarybutton',
                text: 'Create New Product',
                click: function() {
                    //me.launchEditor(Ext.create('Taco.model.Product'));
                }
            }]
        };
    },
    */
    //launchEditor: function (record) {
    //    Ext.defer(function () {
    //        Taco.core.StateManager.attemptNavigate('product/edit/' + record.getId(), { complexMetaData: { _record: record } });
    //    }, 1, this);
    //    return;
    //}
});