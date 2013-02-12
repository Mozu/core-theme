/**
 * @class Taco.view.inventory.Index
 */
Ext.define('Taco.view.inventory.Index', {
    extend: 'Taco.core.ux.content.Container',
    requires: ['Taco.core.ux.BaseGrid', 'Taco.store.InventoryProducts', 'Taco.view.inventory.ItemBrowser'],
    mixins: {
        protectable: 'Taco.core.util.Protectable'
    },

    initComponent: function (eOpts) {

        var itemCount,
            basegridview,
            filtersCfg = {
                ftype: 'filters',
                encode: true,
                //don't reload automatically
                local: false,
                //only filter locally
                // filters may be configured through the plugin,
                // or in the column definition within the headers configuration
                filters: [{
                    type: 'boolean',
                    dataIndex: 'visible'
                }]
            };
        this.header = {
            title: 'Inventory',
            actions: [{
                xtype: 'secondarybutton',
                text: 'Cancel',
                eventName: 'cancel'
            }, {
                xtype: 'dirtybutton',
                text: 'Save',
                listeners: {
                    click: function () {
                        this.store.sync({
                            success: this.onStoreStateChange,
                            scope: this
                        });
                    },
                    scope: this
                }
            }]
        };

        this.store = Ext.create('Taco.store.InventoryProducts', {
            listeners: {
                add: this.onStoreStateChange,
                datachanged: this.onStoreStateChange,
                update: this.onStoreStateChange,
                scope: this
            }
        });
        this.pager = Ext.create('Taco.core.ux.grid.Pager', {
            store: this.store
        });

        this.grid = Ext.create('Taco.core.ux.BaseGrid', {
            store: this.store,
            enableColumnHide: true,
            selType: 'cellmodel',
            plugins: [
                { ptype: 'cellediting', clicksToEdit: 1 }
            ],

            columns: [{
                dataIndex: 'productImages', // Change this hack later
                text: 'Image',
                width: 80,
                sortable: false,
                renderer: function (value) {
                    if (value && value.length > 0) {
                        return '<div class="' + Taco.baseCSSPrefix + '-basegrid-thumbnail"><img width="60px" src="' + value[0].imagePath + '?size=60"></img></div>';
                    } else {
                        return '<div class="' + Taco.baseCSSPrefix + '-image-square ' + Taco.baseCSSPrefix + '-image-placeholder">&nbsp;</div>';
                    }
                }
            }, {
                dataIndex: 'productName',
                text: 'Name',
                flex: 1,
                hideable: false,
                cls: 'taco-frozen',
                renderer: function (value) {
                    return '<a href="javascript:;" class="' + Taco.baseCSSPrefix + 'launch-editor">' + value + '</a>';
                }
            }, {
                dataIndex: 'productCode',
                text: 'Code'
            }, {
                dataIndex: 'optionValues',
                text: 'Options',
                width: 180
            }, {
                xtype: 'numbercolumn',
                dataIndex: 'stockOnHand',
                text: 'Qty in stock',
                tdCls: 'taco-stock',
                width: 120,
                format: '000',
                align: 'right',
                renderer: function (value) {
                    return (value === 0 || value > 0) ? value : 'unlimited';
                }
            }, {
                dataIndex: 'inventoryHandling',
                text: 'If out of stock',
                width: 240,
                renderer: function (value) {
                    switch(value) {
                        case 0:
                            return '<em>(Inventory tracking is off)</em>';
                        case 1:
                            return 'Allow Shopper to backorder';
                        case 2:
                            return 'Hide when out of stock';
                        case 3:
                            return 'Allow Shopper to view Product Details';
                        default:
                            return 'i dont know?';    
                    }
                }
            }],
            dockedItems: [this.pager]
        });

        this.itembrowser = Ext.create('Taco.view.inventory.ItemBrowser', {
            uniquePanels: [this.grid],
            itemStore: this.store,
            itemType: 'products',
            filterProperty: 'productName',
            flex: 1
        });

        Ext.apply(this.body, {
            items: [this.itembrowser]
        });

        this.callParent(arguments);
        
        this.store.load();

        this.grid.getView().on({
            itemclick: this.onItemClick,
            scope: this
        });
        
        this.grid.on({
            cellclick: this.onCellClick,
            scope: this
        });
    },

    onCellClick: function (view, tdEl, cellIndex, record) {

        // *** Cell must have 'taco-stock' class and inventory tracking not turned off
        if ( Ext.fly(tdEl).hasCls(Taco.baseCSSPrefix + 'stock') && record.get('inventoryHandling') !== 0 ) {
            var form = Ext.create('Taco.view.inventory.QuantityEdit', {
                record: record
            }),

            modal = Ext.create('Taco.core.ux.modal.Mini', {
                autoShow: true,
                target: tdEl,
                offset: [0,-30],
                content: {
                    items: [form]
                },
                actions: {
                    items: [{
                        xtype: 'dirtybutton',
                        dirtyState: true,
                        text: 'OK',
                        click: function () {
                            form.update();
                            modal.hide();
                        },
                        scope: this
                    }, {
                        xtype: 'secondaryaction',
                        text: 'Cancel',
                        click: function () {
                            modal.hide();
                        },
                        scope: this
                    }]
                }
            });

            //modal.show();
        }
    },

    onItemClick: function (view, record, elm, index, e) {
        var parentId = record.get('productCode');

        if (e.target.className === Taco.baseCSSPrefix + 'launch-editor') {
            e.preventDefault();
            Taco.app.StateManager.attemptNavigate('products/edit/' + parentId, { id: parentId });
        }
    },

    onStoreStateChange: function (form) {
        var isDirty = this.isDirty(),
            dirtyButton = this.down('dirtybutton');

        dirtyButton.setDirty(isDirty);
    },

    isDirty: function () {
        return (this.store.getNewRecords().length > 0 ||
            this.store.getUpdatedRecords().length > 0 ||
            this.store.getRemovedRecords().length > 0);
    },

    initSaveTasks: function (chain) {
        chain.addSyncStoreTask({
            key: 'inventoryStore',
            depends: [],
            store: this.store
        });

        this.callParent(arguments);
    }
});
