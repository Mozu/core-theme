/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.product.Index', {
    extend: 'Taco.core.ux.browser.SearchList',
    alias: 'widget.prodindex',
    requires: [
        'Taco.model.Product',
        'Taco.store.Products',
        'Taco.view.product.AdvancedSearchForm',
        'Taco.store.ProductGrid',
        'Taco.core.ux.grid.CheckColumnEx'

    ],

    typeName: 'Product',
    modelName: 'Taco.model.Product',
    store: {
        type: 'Taco.store.ProductGrid'
    },
    editorName: 'Taco.view.product.Edit',
    filterProperty: 'productName2',
    useTilePanel: false,
    title: Localizer.langResources.CATALOG.Products.ProductDetails.Title.products,
    enableNavHeader: true,
    addContentViewPadding: true,
    stateful: true,
    stateId: 'statefulProductGrid',
    reFetchRecordOnEdit: true,
    enableSearch: false,
    cancelButtonEnabled: false,
    saveButtonEnabled: false,
    createButtonEnabled: true,
    enableAutoSelect: false,
    createButtonText: Localizer.langResources.CATALOG.Products.ProductDetails.Label.create_new_product,
    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 'c', 's']
    },
    plugins: [
        {
            ptype: 'rowexpander',
            pluginId: 'expander',
            rowBodyTpl: new Ext.XTemplate(
                '<tpl for="productInCatalogs"><tr class="x-grid-row-body">',
                '<td colspan="2" class="x-grid-subcell"><div class="x-grid-cell-inner"></div></td>',
                '<td class="x-grid-subcell"><div class="x-grid-cell-inner"><span class="taco-launch-editor" data-catalog-id="{catalogId}">{productName}</span></div></td>', 
                '<td class="x-grid-subcell"><div class="x-grid-cell-inner"><span class="x-column-content-pill-false"> </span></div></td>',
                '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{[this.formatPrice(values.price,values.catalogId)]}</div></td>',
                '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{[this.formatPrice(values.salePricem,values.catalogId)]}</div></td>',
                '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{catalogId:this.toCatalogName}</div></td>',
                '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{isContentOverridden:this.formatOverridden}</div></td>',
                '<td class="x-grid-subcell"><div class="x-grid-cell-inner"></div></td>',
                '</tr></tpl>', {
                formatOverridden: function (value) {
                    return value ? '<span class="x-column-content-pill x-column-content-pill-true">Yes</span>' : '';
                },
                formatPrice: function (value, catalog) {
                    return (value || value === 0) ? Taco.app.context.findCatalog(catalog).formatCurrency(value) : "<span class='taco-empty-cell'>N/A</span>";
                },
                toCatalogName: function (value) {
                    var catalog = Taco.app.context.findCatalog(value);
                    return catalog ? catalog.name : "<span class='taco-empty-cell'>N/A</span>";
                }
            }),
            hideExpanderFn: function() {
                return Taco.app.context.getCurrent().contextType !== 'm';
            }
        }
    ],
    listeners: {
        afterrender: function (grid) {
            grid.getPlugin('expander').hideExpanderFn();
        }
    },
    bulkEditorColumns: [{
        dataIndex: 'productCode',
        text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.code,
        width: 100
        }, {
        dataIndex: 'productName',
        text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.name,
        minWidth: 120,
        flex: 1,
        editor: {
            xtype: 'textfield'
        }
        }, {
        dataIndex: 'price',
        text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.price,
        width: 100,
        renderer: function (value, metaData, record) {
            return (value || value === 0) ? record.formatCurrency(value) : "<span class='taco-empty-cell'>N/A</span>";
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
        text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.sale_price,
        width: 100,
        renderer: function (value, metaData, record) {
            return (value || value === 0) ? record.formatCurrency(value) : "<span class='taco-empty-cell'>N/A</span>";
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
            tooltip: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.view_product,
            eventName: 'viewitem'
            }, {
            iconCls: 'duplicate',
            tooltip: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.duplicate_product,
            eventName: 'duplicateitem'
            }, {
            iconCls: 'delete',
            tooltip: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.delete_product,
            eventName: 'deleteitem'
            }],
        imageCollection: 'productImages',
        imageField: 'imagePath',
        isDragable: false,
        nameField: 'productName'
    },

    advancedSearchConfig: {
        advancedFormCls: 'Taco.view.product.AdvancedSearchForm',
        emptySearchText: Localizer.langResources.CATALOG.Products.ProductDetails.Label.search
    },

    doCreate: function() {
        var controller = 'products';
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },

    // removeRowExpander: function() {
    //     this.plugins[0].
    // },

    initComponent: function() {
        var me = this;

        if (!me.store.isStore) {
            me.store = Taco.core.data.StoreManager.getOrCreate(me.store);
        }

        if (me.store.proxy && me.store.proxy.extraParams) {
            if (me.store.proxy.extraParams.showProductUsages) {
                delete me.store.proxy.extraParams.showProductUsages;
            }
        }

        // if (Taco.app.context.getCurrent().contextType === 'm') {
        //      this.plugins = [{
        //         ptype: 'rowexpander',
        //         pluginId: 'expander',
        //         rowBodyTpl: new Ext.XTemplate(
        //             '<tpl for="productInCatalogs"><tr class="x-grid-row-body">',
        //             '<td colspan="2" class="x-grid-subcell"><div class="x-grid-cell-inner"></div></td>',
        //             '<td class="x-grid-subcell"><div class="x-grid-cell-inner"><span class="taco-launch-editor" data-catalog-id="{catalogId}">{productName}</span></div></td>',
        //             '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{[this.formatPrice(values.price,values.catalogId)]}</div></td>',
        //             '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{[this.formatPrice(values.salePricem,values.catalogId)]}</div></td>',
        //             '<td classass="x-grid-subcell"><div class="x-grid-cell-inner">{catalogId:this.toCatalogName}</div></td>',
        //             '<td class="x-grid-subcell"><div class="x-grid-cell-inner">{isContentOverridden:this.formatOverridden}</div></td>',
        //             '<td class="x-grid-subcell"><div class="x-grid-cell-inner"></div></td>',
        //             '</tr></tpl>', {
        //                 formatOverridden: function (value) {
        //                     return value ? '<span class="x-column-content-pill x-column-content-pill-true">Yes</span>' : '';
        //                 },
        //                 formatPrice: function (value, catalog) {
        //                     return (value || value === 0) ? Taco.app.context.findCatalog(catalog).formatCurrency(value) : "<span class='taco-empty-cell'>N/A</span>";
        //                 },
        //                 toCatalogName: function (value) {
        //                     var catalog = Taco.app.context.findCatalog(value);
        //                     return catalog ? catalog.name : 'n/a';
        //                 }
        //             })
        //     }];
        // }

        if (Taco.app.context.getCurrent().contextType !== 'm') {
            // this.removeRowExpander();
        }

        this.columns = [
            {
                stateId: 'productCode',
                dataIndex: 'productCode',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.code,
                flex: 4
            },
            {
                stateId: 'productName',
                dataIndex: 'productName',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.name,
                flex: 8,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('productName');
                }
            },
            {
                stateId: 'publishedState',
                dataIndex: 'publishedState',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.status,
                flex: 2,
                renderer: function (value, metaData, record) {
                    var status = record.get('publishedState');
                    var cssClass = 'x-column-content-pill ';
                    cssClass += (status === 'Live') ? 'x-column-content-pill-true' : 'x-column-content-pill-false';
                    return '<span class="' + cssClass + '">' + status + '</span>';
                }
            },
            {
                dataIndex: 'price',
                stateId: 'price',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.price,
                flex: 3,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('price', true) || '<span class="taco-empty-cell">N/A</span>';
                }
            },
            {
                dataIndex: 'salePrice',
                stateId: 'salePrice',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.sale_price,
                flex: 4,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('salePrice', true) || '<span class="taco-empty-cell">N/A</span>';
                }
            },
            {
                dataIndex: 'productInCatalogs',
                stateId: 'catalogs',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.catalogs,
                sortable: false,
                flex: 2,
                renderer: function (value) {
                    return !Ext.isEmpty(value) ? value.length : "<span class='taco-empty-cell'>N/A</span>";
                }
            },
            {
                dataIndex: 'productInCatalogs',
                stateId: 'overridden',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.overridden,
                sortable: false,
                flex: 2,
                renderer: function (value, metaData, record) {
                    var output;
                    var cssClass = 'x-column-content-pill';

                    if (Ext.isEmpty(value)) {
                        return "<span class='taco-empty-cell'>N/A</span>";
                    } else {
                        cssClass = Ext.Array.contains(Ext.Array.pluck(value, 'isContentOverridden'), true) ? 'x-column-content-pill-true' : 'x-column-content-pill-false';
                        output = Ext.Array.contains(Ext.Array.pluck(value, 'isContentOverridden'), true)
                                    || Ext.Array.contains(Ext.Array.pluck(value, 'isPriceOverridden'), true)
                                    || Ext.Array.contains(Ext.Array.pluck(value, 'isSEOContentOverridden'), true)
                                    ? 'Yes' : 'No';
                    }

                    return '<span class="x-column-content-pill ' + cssClass + '">' + output + '</span>';
                }
            },
            {
                dataIndex: "lastModifiedDate",
                stateId: 'lastModifiedDate',
                xtype: 'datecolumn',
                format: 'Y-m-d',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.last_modified,
                hidden: true,
                flex: 2
            },
            {
                dataIndex: "productTypeName",
                stateId: 'productTypeName',
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.product_type,
                sortable: false,
                hidden: true,
                flex: 4
             },
            {
                dataIndex: "productUsage",
                text: Localizer.langResources.CATALOG.Products.ProductDetails.GridHeader.product_usage,
                stateId:"productUsage",
                hidden: true,
                sortable: false,
                flex: 4
            },
            {
                xtype: 'taco.menucolumn',
                stateId: 'actionsColumn',
                menuItems: [{
                    itemId: 'live',
                    text: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.view_live,
                    hideOnClick: false,
                    menu: {
                        plain: true,
                        shadow: false,
                        cls: Taco.baseCSSPrefix + 'grid-row-menu',
                        items: []
                    }
                },
                {
                    itemId: 'preview',
                    text: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.view_staged,
                    hideOnClick: false,
                    menu: {
                        plain: true,
                        shadow: false,
                        cls: Taco.baseCSSPrefix + 'grid-row-menu',
                        items: []
                    }
                },
                {
                    text: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.edit,
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'update'
                    },
                    menuColumnHandler: function (item, eventData) {
                        var page = eventData.grid,
                            record = eventData.record,
                            metaData = {
                                id: record.getId()
                            };

                        page.launchEditor(record, metaData);
                    }
                },
                {
                    text: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.duplicate,
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'create'
                    },                    
                    menuColumnHandler: function (item, eventData) {
                        var record = eventData.record,
                            metaData = {
                                id: record.getId()
                            };
                        var controller = Taco.core.StateManager.getCurrentState().metaData.controller;
                        Taco.app.StateManager.attemptNavigate(controller + '/duplicate/' + record.getId(), metaData);
                    }
                },
                {
                    text: Localizer.langResources.CATALOG.Products.ProductDetails.ActionColumn.delete_prod,
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'destroy'
                    },
                    menuColumnHandler: 'destroyMenuColumnHandler'
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
                                        window.open('/_gosite/' + site.id + '?environment=preview&redir=' + encodeURIComponent('/p/' + eventData.record.getId()));
                                    }
                                }, defaults));

                                liveAction.menu.add(Ext.applyIf({
                                    text: site.name,
                                    menuColumnHandler: function (item, eventData) {
                                        window.open('/_gosite/' + site.id + '?environment=live&redir=' + encodeURIComponent('/p/' + eventData.record.getId()));
                                    }
                                }, defaults));
                            }
                        });
                    });
                    previewAction.setVisible(eventData.record.productInCatalogsStore().count());
                }
            }]
        this.callParent(arguments);
    },
});