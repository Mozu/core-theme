/**
 * @class Taco.view.storefrontProduct.Grid
*/
Ext.define('Taco.view.storefrontProduct.Grid', {
    extend: 'Ext.grid.Panel',

    requires: [
        'Taco.model.StorefrontProduct',
        'Taco.store.StorefrontProducts'
    ],

    mixins: {
        pageable: 'Taco.core.ux.mixins.Pageable',
        searchable: 'Taco.core.ux.mixins.Searchable'
    },

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['c', 's']
    },

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.StorefrontProduct',

    enableNavHeader: false,
    launchEditorOnClick: false,
    // adds the 'taco-content-navcontainer-padding' class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,
    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: false,
    createButtonEnabled: false,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,
    showActionsColumn: false,
    enableEditAction: false,
    enableDuplicateAction: false,
    enableDeleteAction: false,
    hideSearchToolbar: false,
    enableQuickFilters: false,
    autoScroll: true,
    stateful: false,
    headerToolbar: true,
    header: {
        layout: {
            type: 'hbox',
            align: 'left'
        }
    },
    layout: {
        type: 'fit'
    },

    viewConfig: {
        emptyText: 'No items found.'
    },

    store: { type: 'Taco.store.StorefrontProducts' },

    advancedSearchConfig: {
        disableAdvancedSearch: true
    },

    onCreate: Ext.emptyFn,
    statics: {},

    initComponent: function() {
        var me = this;
        
        me.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.StorefrontProducts');
        me.mixins = me.mixins || [];
        me.dockedItems = me.dockedItems || [];
        me.columns = me.getColumnConfig();

        if (me.enableSearch) {
            this.mixins.searchable.constructor.apply(this);
            me.dockedItems.push(me.createSearchToolbar());
        }

        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }

        me.on('taco-update-preview', function(config) {
            var key;
            for (key in config) { // method to delete a key so its not passed as an empty value
                if (config.hasOwnProperty(key) && typeof config[key] === 'undefined') {
                    delete config[key];
                    delete this.store.proxy.extraParams[key];
                }
            }

            var params = Ext.apply(this.store.proxy.extraParams, config);
            if (typeof params.siteId !== 'undefined' && typeof params.dataViewMode !== 'undefined' && typeof params.expression !== 'undefined') {
                me.store.load();
            }
        }, me);

        me.on('taco-empty-preview-grid', function() {
            me.store.loadData([], false);
        });

        me.siteSelector = Ext.create('Taco.core.ux.content.ContextMenu', {
            fieldLabel: 'Site',
            supportedLevels: ['s'],
            requiresContextOfType: ['c', 's'],
            changeContext: Ext.emptyFn,
            margin: '0 10 10 0',
            listeners: {
                afterrender: function(component, eOpts) {
                    var item = this.store.data.items[0];
                    this.setValue(item);
                    me.store.proxy.extraParams.siteId = item.data.id;
                    // TODO: needs to persist the site context on the form record, or does it?
                },
                select: function (component, record) {
                    me.fireEvent('taco-update-preview', {
                        siteId: record[0].get('id')
                    });
                },
                scope: me.siteSelector
            }
        });

        me.dataViewModeSelector = Ext.create('Taco.core.ux.form.SelectField', {
            xtype: 'selectfield',
            fieldLabel: 'State',
            fields: ['text', 'value'],
            name: 'me.siteViewModeSelector',
            store: ['Pending','Live'],
            editable: false,
            forceSelection: true,
            value: 'Live',
            margin: '0 10 10 0',
            listeners: {
                select: function (source, records) {
                    var dataViewMode = source.getValue();
                    var data = {
                        dataViewMode: dataViewMode
                    };
                    if (dataViewMode === 'Pending') {
                        me.sitePreviewDate.show();
                    } else {
                        me.sitePreviewDate.hide();
                        data.previewDate = undefined;
                    }
                    me.fireEvent('taco-update-preview', data);
                },
                scope: me.dataViewModeSelector
            }
        });

        me.sitePreviewDate = Ext.create('Taco.core.ux.form.DateTime', {
            fieldLabel: 'Preview Date',
            hidden: true,
            margin: '0 10 10 0',
            minWidth: 200,
            listeners: {
                change: function(component, newValue, oldValue, eOpts) {
                    me.fireEvent('taco-update-preview', {
                        previewDate: newValue
                    });
                },
                scope: me.sitePreviewDate
            }
        });

        me.header.items = me.combineHeaderItems();

        me.store.proxy.extraParams.siteId = me.siteSelector.value;
        me.store.proxy.extraParams.dataViewMode = me.dataViewModeSelector.value;

        me.callParent(arguments);
    },

    combineHeaderItems: function() {
        var staticHeaderItems = [this.siteSelector, this.dataViewModeSelector, this.sitePreviewDate],
            items; 

        if (this.additionalHeaderItems) {
            items = staticHeaderItems.concat(this.header.additionalHeaderItems);
        }

        else {
            items = staticHeaderItems;
        }

        return items;
    },

    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function() {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'productCode',
                stateId: 'productCode',
                text: 'Code',
                hideable: false,
                flex: 1,
                minWidth: 100
            },
            {
                xtype: 'gridcolumn',
                stateId: 'name',
                dataIndex: 'name',
                text: 'Name',
                minWidth: 120,
                flex: 1,
                sortable: false
            },
            {
                xtype: 'gridcolumn',
                stateId: 'productType',
                dataIndex: 'productType',
                text: 'Product Type',
                minWidth: 120,
                flex: 1,
                sortable:false
            },
            {
                xtype: 'gridcolumn',
                stateId: 'price',
                dataIndex: 'price',
                text: 'Price',
                minWidth: 100,
                flex: 1,
                align: 'right',
                renderer: function(value, metaData, record) { return value != null ? record.formatCurrency(value) : null; }
            },
            {
                xtype: 'gridcolumn',
                stateId: 'salePrice',
                dataIndex: 'salePrice',
                text: 'SalePrice',
                minWidth: 100,
                flex: 1,
                align: 'right',
                renderer: function(value, metaData, record) { return value != null ? record.formatCurrency(value): null; }
            },
            {
                xtype: 'gridcolumn',
                stateId: 'productUsage',
                dataIndex: 'productUsage',
                text: 'Usage',
                minWidth: 120,
                hideable: true,
                hidden: true,
                flex: 1,
                sortable: false
            },
            {
                xtype: 'gridcolumn',
                stateId: 'createDate',
                dataIndex: 'createDate',
                text: 'Create Date',
                minWidth: 120,
                flex: 1,
                hideable: true,
                hidden: true
            }
        ];

    },

    // list of actions to put in action column and context menu;
    getActionItems: function() {
        var me = this,
            actions = [];

        if (this.enableEditAction) {
            actions.push({
                text: 'Edit',
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior: 'update'
                },
                menuColumnHandler: function(item, eventData) {
                    var record = eventData.record;
                    Ext.defer(function() {
                        Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
                    }, 1, this);
                }
            });
        }

        if (this.enableDuplicateAction) {
            actions.push({
                text: 'Duplicate',
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior: 'create'
                },
                menuColumnHandler: function(item, eventData) {
                    var record = eventData.record,
                        metaData = {
                            id: record.getId()
                        };

                    Taco.app.StateManager.attemptNavigate('discounts/duplicate/' + record.getId(), metaData);
                }
            });
        }

        if (this.enableDeleteAction) {
            actions.push({
                text: 'Delete',
                itemId: 'deleteMenuItem',
                // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                menuColumnHandler: 'deleteMenuColumnHandler',
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior: 'delete'
                },
                scope: me
            });
        }

        return actions;

    },

    onActionMenuShow: function(menu, eventData) {
        var me = this;

        // need to disable the delete menu option when discount has been used
        var deleteMenuItem = menu.down('#deleteMenuItem');
        if (deleteMenuItem) {
            if (eventData.record.get('canBeDeleted')) {
                deleteMenuItem.show();
            } else {
                deleteMenuItem.hide();
            }
        }
    },

    getActionColumn: function() {
        var me = this,
            actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                onMenuShow: me.onActionMenuShow,
                menuItems: actions
            };
        }

        return actionColumn;
    }

});