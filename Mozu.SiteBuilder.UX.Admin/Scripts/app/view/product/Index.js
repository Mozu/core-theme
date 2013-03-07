/**
 * @class Taco.view.product.Index
 */
Ext.define('Taco.view.product.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.prodindex',
    requires: ['Taco.model.Product', 'Taco.store.Products', 'Ext.ux.RowExpander'],

    typeName: 'Product',
    modelName: 'Taco.model.Product',
    storeName: 'Taco.store.Products',
    editorName: 'Taco.view.product.Edit',
    filterProperty: 'productName',

    gridPanelConf: {
        columns: [{
            dataIndex: 'productCode',
            text: 'Code',
            width: 100
        }, {
            dataIndex: 'productName',
            text: 'Name',
            minWidth: 120,
            resizable: false,
            flex: 1,
            renderer: function(value) {
                return '<a href="#" class="taco-launch-editor">' + value + '</a>';
            }
        }, {
            dataIndex: 'price',
            text: 'Price',
            width: 70,
            renderer: function (value) {
                return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
            }
        }, {
            dataIndex: 'salePrice',
            text: 'Sale Price',
            width: 100,
            renderer: function (value) {
                return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
            }
        }, {
            dataIndex: 'productInSites',
            text: 'Sites',
            sortable:false,
            width: 120,
            renderer: function (value) {
                return !Ext.isEmpty(value) ? value.length : '--';
            }
        }, {
            dataIndex: 'productInSites',
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
            dataIndex: 'stockOnHand',
            text: 'Stock',
            width: 70,
            renderer: function (value) {
                return Ext.isNumeric(value) ? value : '--';
            }
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                tpl: [
                    '<tpl if="this.isMultiSite(productInSites)">',
                        '<div>Preview in</div>',
                    '<tpl else>',
                        'Preview',
                    '</tpl>',
                    '<ul class="' + Taco.baseCSSPrefix + 'grid-row-menu-list"><tpl for="productInSites">',
                        '<li>{siteId:this.toSiteName}</li>',
                    '</tpl></ul>', {
                        isMultiSite: function (value) {
                            return !Ext.isEmpty(value);
                        },
                        toSiteName: function (value) {
                            var site = Taco.app.context.findSite(value);
                            return site ? site.name : 'n/a';
                        }
                    }
                ]
            }, {
                text: 'Delete',
                eventName: 'deleteproduct'
            }, {
                text: 'Edit',
                eventName: 'editproduct'
            }]
        }],
        listeners: {
            deleteproduct: function (grid, record) {
                var modal = Ext.create('Taco.core.ux.modal.Confirmation', {
                    autoShow: true,
                    content: {
                        html: 'Are you sure you want to delete this product?'
                    },
                    listeners: {
                        cancel: Ext.emptyFn,
                        confirm: function () {
                            var store = grid.getStore();
                            grid.setLoading(true);
                            store.remove(record);
                            store.sync({
                                success: function (m) {
                                    grid.setLoading(false);
                                },
                                failure: function (m) {
                                    grid.setLoading(false);
                                }
                            });
                        },
                        scope: this
                    }
                });
            },
            editproduct: function (grid, record) {
                var page = grid.up('browserpage'),
                    metaData = { id: record.getId() };

                page.launchEditor(record, metaData);
                Taco.app.StateManager.addState(page.token + '/edit/' + record.getId(), metaData);
            },
            viewproduct: Ext.emptyFn,
            scope: this
        },
        contextConf: {
            c: {
                useMultiGrid: true,
                plugins: [{
                    ptype: 'rowexpander',
                    pluginId: 'expander',
                    rowBodyTpl: new Ext.XTemplate(
                        '<tpl for="productInSites"><tr class="x-grid-row-body">',
                            '<td colspan="3" class="x-grid-cell"><div class="x-grid-cell-inner"></div></td>',
                            '<td class="x-grid-cell"><div class="x-grid-cell-inner"><a href="#" class="taco-launch-editor" data-site-id="{siteId}">{parent.productName}</a></div></td>',
                            '<td class="x-grid-cell"><div class="x-grid-cell-inner">{price:this.formatPrice}</div></td>',
                            '<td class="x-grid-cell"><div class="x-grid-cell-inner">{salePrice:this.formatPrice}</div></td>',
                            '<td class="x-grid-cell"><div class="x-grid-cell-inner">{siteId:this.toSiteName}</div></td>',
                            '<td class="x-grid-cell"><div class="x-grid-cell-inner">{isContentOverridden:this.formatOverridden}</div></td>',
                            '<td class="x-grid-cell"><div class="x-grid-cell-inner"></div></td>',
                        '</tr></tpl>',
                    {
                        formatOverridden: function (value) {
                            return value ? '<span class="overridden">Overridden</span>' : '';
                        },
                        formatPrice: function (value) {
                            return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
                        },
                        toSiteName: function (value) {
                            var site = Taco.app.context.findSite(value);
                            return site ? site.name : 'n/a';
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
        renderer: function (value) {
            return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
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
        renderer: function (value) {
            return (value || value === 0) ? Ext.util.Format.usMoney(value) : '--';
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
        nameField: 'productName',
    },

    launchLoadedEditor: function (record, options) {
        var site = Taco.app.context.getCurrentSite(),
            infoStore,
            infoRecord;

        if (record.phantom && site) {
            infoStore = record.productInSitesStore();
            siteInfo = Ext.create('Taco.model.ProductInSiteInfo', {
                siteId: site.id,
                productCode: record.getId()
            });
            siteInfo.phantom = true;
            infoStore.add(siteInfo);
            siteInfo.set('productCote', record.getId());
            siteInfo.phantom = true;
        }
        this.callParent(arguments);
    }
    
});
