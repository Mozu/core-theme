/**
 * @class Taco.view.pendingChange.Catalog
 */
Ext.define('Taco.view.pendingChange.Product', {
    extend: 'Taco.core.ux.browser.BrowserPage',

    requires: [
        'Taco.model.Product',
        'Taco.store.Products',
        'Taco.core.ux.grid.MenuColumn'
   ],

    typeName: 'Pending Product Changes',
    modelName: 'Taco.model.Product',

    filterProperty: 'productName2',
    store: { type: 'Taco.store.Products' },
    useTilePanel: false,

    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 's', 'c']
    },
    
    filterFormConf: {
        width: 600,
        cls: Taco.baseCSSPrefix + 'combofilter-form products',
        items: [{
            xtype: 'container',
            justify: false,
            defaults: {
                xtype: 'textfield',
                width: 560
            },
            items: [{
                name: 'productCode',
                fieldLabel: 'Product Code',
                width: 160
            }, {
                name: 'productName',
                fieldLabel: 'Name'
            }]
        }]
    },

    filterProperties: [{
        property: 'all',
        text: 'All',
        isDefault: true
    }, {
        property: 'productName',
        text: 'Name'
    }, {
        property: 'productCode',
        text: 'Code'
    }, {
        property: 'producttypeid',
        text: 'Product Type'
    }, {
        property: 'productFullDescription',
        text: 'Description'
    }],

    header: {
        actions: [{
            xtype: 'button',
            text: 'Discard All',
            margin: '0 10 0 0',
            ui: 'action',
            scale: 'medium',
            handler: function (button) {
                button.up('contentcontainer').discardAll();
            }
        }, {
            xtype: 'button',
            itemId: 'publishAll',
            ui: 'action-primary',
            scale: 'medium',
            menuAlign: 'tr-br?',
            text: 'Publish All',
            handler: function (button) {
                button.up('contentcontainer').publishAll();
            }
        }]
    },
    
    initComponent: function () {
        this.store = {
            type: 'Taco.store.Products',
            id: 'product.publishing',
            filters: [{ property: 'publishedstate', value: 'Pending' }],
            clearFilters: false
        };
       
        this.callParent(arguments);
         
    },
    
//    initComponent: function () {
//        var me = this;
//        me.callParent(arguments);
//
//        me.store.clearFilter();
//        me.store.filter('publishedstate', 'Pending');
//    },
    
    gridPanelConf: {
        selType: 'checkboxmodel',
        stateful: true,
        stateId: 'statefulPendingProductChangesGrid',
        dockedItems: [{
            xtype: 'toolbar',
            dock: 'top',
            border: false,
            items: [{
                xtype: 'button',
                ui: 'action',
                scale: 'medium',
                menuAlign: 'tr-br?',
                text: 'Bulk Actions',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        text: 'Publish',
                        handler: function () {
                            var grid = this.grid || (this.grid = this.up('grid')),
                                checkedModels = grid.getSelectionModel().getSelection(),
                                store = grid.store;

                            // Get out if no selections
                            if (!checkedModels) return;

                            var codes = Ext.Array.pluck(Ext.Array.pluck(checkedModels, 'data'), 'productCode');

                            Taco.model.Product.publishBulk({
                                data: codes,
                                success: function () {
                                    store.reload();
                                },
                                failure: function () {
                                    Taco.MessageBox.alert(
                                        'Sorry!',
                                        'The selected product changes could not be published.'
                                    );
                                }
                            });
                        }
                    }, {
                        text: 'Discard',
                        handler: function () {
                            var grid = this.up('grid'),
                            checkedModels = grid.getSelectionModel().getSelection(),
                            store = grid.store;

                            // Get out if no selections
                            if (!checkedModels) return;

                            var codes = Ext.Array.pluck(Ext.Array.pluck(checkedModels, 'data'), 'productCode');

                            Taco.model.Product.discardBulk({
                                data: codes,
                                success: function () {
                                    store.reload();
                                },
                                failure: function () {
                                    Taco.MessageBox.alert(
                                        'Sorry!',
                                        'The selected product changes could not be discarded.'
                                    );
                                }
                            });
                        }
                    }]
                }
            }]
        }],
        columns: [{
            dataIndex: 'productCode',
            stateId: 'productCode',
            text: 'Code',
            width: 100
        }, {
            dataIndex: 'productName',
            stateId: 'productName',
            text: 'Name',
            minWidth: 120,
            resizable: false,
            flex: 1,
            renderer: function (value, metaData, record) {
                return record.getContextualValue('productName');

            }
        }, {
            dataIndex: 'publishedState',
            stateId: 'publishedState',
            text: 'Modification',
            width: 130
        }, {
            dataIndex: 'lastModifiedDate',
            stateId: 'lastModifiedDate',
            text: 'Last Modified',
            width: 150,
            renderer: Ext.util.Format.dateRenderer('d M, Y')
        }, {
            dataIndex: 'lastModifiedBy',
            stateId: 'lastModifiedBy',
            text: 'Modified By',
            width: 150,
            renderer: function(value, metaData, record) {
                var u = record.get('lastModifiedByUser');

                return u
                    ? u.FirstName + " " + u.LastName
                    : '--';
            }
        }, {
            dataIndex: 'lastPublishedDate',
            stateId: 'lastPublishedDate',
            text: 'Last Published',
            width: 150,
            renderer: Ext.util.Format.dateRenderer('d M, Y')
        }, {
            dataIndex: 'lastPublishedBy',
            stateId: 'lastPublishedBy',
            text: 'Published By',
            width: 150,
            renderer: function (value, metaData, record) {
                var u = record.get('lastPublishedByUser');
                return u
                   ? u.FirstName + " " + u.LastName
                   : '--';
                
            }
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                text: 'Publish',
                menuColumnHandler: function (item, eventData) {
                    Taco.model.Product.publishBulk({
                        data: [eventData.record.getId()],
                        success: function () {
                            eventData.grid.store.reload();
                        },
                        failure: function () {
                            Taco.MessageBox.alert(
                                'Sorry!',
                                'Failed to publish pending product changes.'
                            );
                        }
                    });
                }
            }, {
                text: 'Discard',
                menuColumnHandler: function (item, eventData) {
                    Taco.model.Product.discardBulk({
                        data: [eventData.record.getId()],
                        success: function () {
                            eventData.grid.store.reload();
                        },
                        failure: function () {
                            Taco.MessageBox.alert(
                                'Sorry!',
                                'Failed to discard pending product changes.'
                            );
                        }
                    });
                }
            }]
        }]
    },


    publishAll: function () {
        var store = this.store;

        Taco.model.Product.publishAll({
            success: function () {
                store.reload();
            },
            failure: function () {
                Taco.MessageBox.alert(
                    'Sorry!',
                    'Failed to publish all pending product changes.'
                );
            }
        })
    },

    discardAll: function () {
        var store = this.store;

        Taco.model.Product.discardAll({
            success: function () {
                store.reload();
            },
            failure: function () {
                Taco.MessageBox.alert(
                    'Sorry!',
                    'Failed to discard all pending product changes.'
                );
            }
        })
    }
});
