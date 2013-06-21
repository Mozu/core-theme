/**
 * @class Taco.view.order.Index
 */


Ext.define('Taco.view.order.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.orderindex',
    requires: ['Taco.model.Order', 'Taco.store.Orders', 'Ext.ux.RowExpander'],

    typeName: 'Order',
    modelName: 'Taco.model.Order',
    store: { type: 'Taco.store.Orders' },
    editorName: 'Taco.view.order.Edit',
    filterProperty: 'orderNumber',
    useTilePanel: false,
    //todo:  changing to s until orders support site id in resource
    requiresContextOfType: ['s'],

    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form orders',
        items: [{
            xtype: 'formflexbox',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [{
                name: 'orderNumber',
                fieldLabel: 'Order Number',
                width: 160
            }
            /*
            {
                name: 'productName',
                fieldLabel: 'Name'
            }
            */

            ]
        }]
    },

    filterProperties: [{
        property: 'all',
        text: 'All',
        isDefault: true
    }, {
        property: 'productName',
        text: 'Abandoned'
    }, {
        property: 'productCode',
        text: 'Awaiting Payment'
    }, {
        property: 'producttypeid',
        text: 'Awaiting Shipment'
    }, {
        property: 'productFullDescription',
        text: 'Shipped'
    }],
    
    header:{
        actions: []
    },


    gridPanelConf: {
        columns: [{
            dataIndex: 'orderNumber',
            text: 'Order Number',
            width: 100
        }, {
            dataIndex: 'createDate',
            text: 'Order Date',
            minWidth: 180,
            //resizable: false,
            flex: 1
        }, {
            dataIndex: 'billingContact',
            text: 'First Name',
            width: 120,
            getSortParam: function () {
                return 'billingContact.firstName';
            },
            renderer: function (value, metaData, record) {
                return value.firstName;
            }
        }, {
            dataIndex: 'billingContact',
            text: 'Last Name',
            width: 120,
            getSortParam: function () {
                return 'billingContact.lastName';
            },
            renderer: function (value, metaData, record) {
                return value.lastName;
            }
        }, {
            dataIndex: 'total',
            text: 'Order Total',
            renderer: 'usMoney',
            width: 100
        }, {
            dataIndex: 'orderStatus',
            text: 'Order Status',
            width: 100
        }, {
            dataIndex: 'shippingStatus',
            text: 'Shipping Status',
            width: 120
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [
            {
                text: 'Edit',
                menuColumnHandler: function (item, eventData) {
                    var page = eventData.grid.getParentPage(),
                        record = eventData.record,
                        metaData = { id: record.getId() };

                    page.launchEditor(record, metaData);

                }
            }, {
                text: 'Mark as shipped',
                menuColumnHandler: function (item, eventData) {
                    // Either open ui for mark as shipped or call the service method if one exists for this action.
                }
            }, {
                text: 'Capture Payment',
                menuColumnHandler: function (item, eventData) {
                    //open ui for capture payment. 
                    // note: this option may or may not apply depending on the status of the order.
                    // need to determine if this is an appropriate menu option.
                }
            }, {
                text: 'Cancel Order',
                menuColumnHandler: function (item, eventData) {
                    // open ui for cancel order or call the service method if one exists for this action.
                }
            }],
            
            // do any processing needed to show menu
            onMenuShow: function (menu, eventData) {
                
                
                
                

                /*
                var previewAction = menu.items.get('preview'),
                    defaults = eventData.header.menuItemDefaults;

                previewAction.menu.removeAll();
                eventData.record.productInSitesStore().each(function (record) {
                    var site = record.get('site');
                    previewAction.menu.add(Ext.applyIf({
                        text: (site ? site.name : 'n/a'),
                        menuColumnHandler: function (item, eventData) {
                            window.open('/_gosite/' + record.getId() + '?environment=preview&redir=' + encodeURIComponent('/product/' + eventData.record.getId()), 'taco-preview');

                            console.log(arguments);
                        }
                    }, defaults));
                });
                previewAction.setVisible(eventData.record.productInSitesStore().count());
                */
            }
        }]

        /*
        
        ,
        contextConf: {
            c: {
                useMultiGrid: true,
                plugins: [{
                    ptype: 'rowexpander',
                    pluginId: 'expander',
                    rowBodyTpl: new Ext.XTemplate(
                        '<tpl for="productInSites"><tr class="x-grid-row-body">',
                            '<td colspan="3" class="x-grid-cell"><div class="x-grid-cell-inner"></div></td>',
                            '<td class="x-grid-cell"><div class="x-grid-cell-inner"><a href="#" class="taco-launch-editor" data-site-id="{siteId}">{productName}</a></div></td>',
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
        */

    },



    /*

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


    */
    
    /*
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

    */

    launchLoadedEditor: function (record, options) {
        var site = Taco.app.context.getCurrentSite(),
            infoStore,
            infoRecord;

        this.callParent(arguments);
    }

});





/**
 * @class Taco.view.order.Index
 */


/*

Ext.define('Taco.view.order.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: [
    //    'Taco.model.Order',
        'Taco.view.order.Grid',
        'Taco.view.order.Edit'
    ],

    initComponent: function () {
        var me = this;

        this.header = {
            title: 'Orders'
        };

        this.store = Ext.create('Ext.data.Store', {
            model: 'Taco.model.Order',
            remoteSort: true,
            remoteFilter: true,
            pageSize: 25
        });

        this.gridpanel = Ext.create('Taco.view.order.Grid', {
            store: this.store
        });

        Ext.apply(me.body, {
            layout:'fit',
            items: [me.gridpanel]
        });

        this.callParent(arguments);

        this.gridpanel.on({
            itemclick: {
                fn: this.onItemClick,
                scope: this
            }
        });

        this.store.load();
    },

    launchEditor: function (record) {
        var me = this,
            editorView;

        editorView = Ext.create('Taco.view.order.Edit', {
            logicalParent: me,
            recordId: record
        });

        Taco.app.contentView.add(editorView);
    },

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('orders/edit/' + record.get('orderNumber'), { id: record.getId() });
        }
    }
});

*/