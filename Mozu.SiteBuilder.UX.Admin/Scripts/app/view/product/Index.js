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
    title: 'Products',
    enableNavHeader: true,
    addContentViewPadding: true,
    stateful: true,
    stateId: 'statefulProductGrid',
    reFetchRecordOnEdit: true,
    enableSearch: false,
    cancelButtonEnabled: false,
    saveButtonEnabled: false,
    createButtonEnabled: true,
    createButtonText: 'Create New Product',
    plugins: [{
        ptype: 'rowexpander',
        pluginId: 'expander',
        rowBodyTpl: new Ext.XTemplate(
            '<tpl for="productInCatalogs"><tr class="x-grid-row-body">',
            '<td colspan="2" class="x-grid-subcell"><div class="x-grid-cell-inner"></div></td>',
            '<td class="x-grid-subcell"><div class="x-grid-cell-inner"><span class="taco-launch-editor" data-catalog-id="{catalogId}">{productName}</span></div></td>',
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
                    return catalog ? catalog.name : 'n/a';
                }
            })
    }],
    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 'c', 's']
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
            return (value || value === 0) ? record.formatCurrency(value) : 'N/A';
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
            return (value || value === 0) ? record.formatCurrency(value) : 'N/A';
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
        advancedFormCls: 'Taco.view.product.AdvancedSearchForm',
        emptySearchText: 'Search'
    },

    doCreate: function() {
        var controller = 'products';
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },

    initComponent: function() {
        var me = this;

        if (!me.store.isStore) {
            me.store = Taco.core.data.StoreManager.getOrCreate(me.store);
        }

        this.columns = [
            {
                    stateId: 'productCode',
                    dataIndex: 'productCode',
                    text: 'Code',
                    flex: 4
            },
            {
                stateId: 'productName',
                dataIndex: 'productName',
                text: 'Name',
                flex: 8,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('productName');

                }
            },
            {
                dataIndex: 'price',
                stateId: 'price',
                text: 'Price',
                flex: 3,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('price', true) || '<span class="taco-empty-cell">N/A</span>';

                }
            },
            {
                dataIndex: 'salePrice',
                stateId: 'salePrice',
                text: 'Sale Price',
                flex: 4,
                renderer: function (value, metaData, record) {
                    return record.getContextualValue('salePrice', true) || '<span class="taco-empty-cell">N/A</span>';
                }
            },
            {
                dataIndex: 'productInCatalogs',
                stateId: 'catalogs',
                text: 'Catalogs',
                sortable: false,
                flex: 2,
                renderer: function (value) {
                    return !Ext.isEmpty(value) ? value.length : 'N/A';
                }
            },
            {
                dataIndex: 'productInCatalogs',
                stateId: 'overridden',
                text: 'Overridden',
                sortable: false,
                flex: 2,
                renderer: function (value, metaData, record) {
                    var output;
                    var cssClass = 'x-column-content-pill';

                    if (Ext.isEmpty(value)) {
                        output = 'N/A';
                    } else {
                        cssClass = Ext.Array.contains(Ext.Array.pluck(value, 'isContentOverridden'), true) ? 'x-column-content-pill-true' : 'x-column-content-pill-false';
                        output = Ext.Array.contains(Ext.Array.pluck(value, 'isContentOverridden'), true) ? 'Yes' : 'No';
                    }

                    return '<span class="x-column-content-pill ' + cssClass + '">' + output + '</span>';
                }
            },
            {
                dataIndex: "lastModifiedDate",
                stateId: 'lastModifiedDate',
                xtype: 'datecolumn',
                format: 'Y-m-d',
                text: 'Last Modified',
                hidden: true,
                flex: 2
            },
            {
                dataIndex: "productTypeName",
                stateId: 'productTypeName',
                text: 'Product Type',
                sortable: false,
                hidden: true,
                flex: 4
             },
            {
                dataIndex: "productUsage",
                stateId: 'productUseage',
                text: 'Product usage',
                stateId:"productUsage",
                hidden: true,
                sortable: false,
                flex: 4
            },
            {
                xtype: 'taco.menucolumn',
                stateId: 'actionsColumn',
                flex: 1,
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
                },
                {
                    itemId: 'preview',
                    text: 'View Staged',
                    hideOnClick: false,
                    menu: {
                        plain: true,
                        shadow: false,
                        cls: Taco.baseCSSPrefix + 'grid-row-menu',
                        items: []
                    }
                },
                {
                    text: 'Edit',
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
                    text: 'Duplicate',
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'create'
                    },                    
                    menuColumnHandler: function (item, eventData) {
                        var page = eventData.grid,
                            record = eventData.record,
                            metaData = {
                                id: record.getId()
                            };
                        
                        var controller = page.getControllerName();
                        Taco.app.StateManager.attemptNavigate(controller + '/duplicate/' + record.getId(), metaData);
                    }
                },
                {
                    text: 'Delete',
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
    }
});