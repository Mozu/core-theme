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
    
    layout: {
        type: 'fit'
    },
    header: false,

    viewConfig: {
        emptyText: 'No items found.'
    },

    advancedSearchConfig: {
        disableAdvancedSearch: true
    },

    onCreate: Ext.emptyFn,
    statics: {},

    initComponent: function() {
        var me = this;

        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.StorefrontProducts',
            createOnly: true,
            sorters: [
                {
                    property: 'name',
                    direction: 'ASC'
                }
            ]
        });
        me.mixins = me.mixins || [];
        me.columns = me.getColumnConfig();

        if (me.enablePaging) {
            // initialize the grid paging toolbar mixin
            this.mixins.pageable.constructor.apply(this);
        }

        me.on('taco-update-preview', function (config) {
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

        me.items = [{
                xtype: 'container',
                dock: 'bottom',
                html: 'Only products that appear on the storefront are returned in this list',
                padding: '20 10'
            }];

        var ctx = Taco.app.context.getCurrentContext();
        var sites = (ctx.sites) ? ctx.sites : (ctx.catalog && ctx.catalog.sites) ? ctx.catalog.sites : [];
        var defaultSite = sites[0] || null;
        var defaultSiteId = (defaultSite) ? defaultSite.id : "";
        
        me.store.proxy.extraParams.siteId = defaultSiteId;

        var publishingEnabled = false;
        if (defaultSite) {
            publishingEnabled = defaultSite.masterCatalog.isContentPublishingEnabled;
        }
        me.siteSelector = Ext.create('Ext.form.field.ComboBox', {
            fieldLabel: 'Site',
            queryMode: 'local',
            flex:1,
            displayField: 'name',
            valueField: 'id',
            margin: '0 10 10 0',
            value:defaultSiteId,
            store: Ext.create('Ext.data.Store', {
                fields: ['id', 'name'],
                data : sites
            }),

            listeners: {
                select: function (component, records) {
                    var record = records[0];
                    var data = {
                        siteId: record.get('id')
                    };
                    if (record.raw.masterCatalog.productPublishingMode === 'Live') {
                        me.dataViewModeSelector.setValue('Live').hide();
                        me.sitePreviewDate.hide();
                        data.dataViewMode = 'Live';
                    } else {
                        me.dataViewModeSelector.show();
                        if (me.dataViewModeSelector.getValue() === 'Pending') {
                            me.sitePreviewDate.show();
                        }
                    }

                    me.fireEvent('taco-update-preview', data);
                },
                scope: me.siteSelector
            }
        });

        var dataViewModeStoreData = [{ name:'Live', value:'Live' }];
        if (publishingEnabled) {
            dataViewModeStoreData.push({ name: 'Staged', value: 'Pending' });
        }

        me.dataViewModeSelector = Ext.create('Taco.core.ux.form.SelectField', {
            xtype: 'selectfield',
            queryMode: 'local',
            fieldLabel: 'State',
            displayField: 'name',
            valueField: 'value',
            flex:1,
            //fields: ['name', 'value'],
            name: 'me.siteViewModeSelector',
            store: Ext.create('Ext.data.Store', {
                fields:['name','value'],
                data: dataViewModeStoreData
            }),
            editable: false,
            forceSelection: true,
            value: 'Live',
            margin: '0 10 10 0',
            hidden: !publishingEnabled,
            listeners: {
                select: function (source, records) {
                    var fieldValue = source.getValue();
                    var data = {dataViewMode: fieldValue };
                    if (fieldValue === 'Pending') {
                        me.sitePreviewDate.show();
                    } else {
                        me.sitePreviewDate.hide();
                        data.previewDate = undefined; // unset for api call
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
            flex:1,
            //minWidth: 200,
            listeners: {
                change: function(component, newValue, oldValue, eOpts) {
                    me.fireEvent('taco-update-preview', {
                        previewDate: newValue
                    });
                },
                scope: me.sitePreviewDate
            }
        });

        me.dockedItems = me.dockedItems || [];
        me.dockedItems.push({
            xtype: "container",
            docked: "top",
            layout: "hbox",
            items: [me.siteSelector, me.dataViewModeSelector, me.sitePreviewDate]
        });

        if (me.enableSearch) {
            this.mixins.searchable.constructor.apply(this);
            me.dockedItems.push(me.createSearchToolbar());
        }

        me.store.proxy.extraParams.siteId = me.siteSelector.value;
        me.store.proxy.extraParams.dataViewMode = me.dataViewModeSelector.value;

        me.callParent(arguments);
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
                text: 'Sale Price',
                minWidth: 100,
                flex: 1,
                align: 'right',
                renderer: function(value, metaData, record) { return value != null ? record.formatCurrency(value): null; }
            },
            {
                xtype: 'gridcolumn',
                stateId: 'productType',
                dataIndex: 'productType',
                text: 'Product Type',
                minWidth: 120,
                flex: 1,
                sortable:false
            }/*,
            {
                xtype: 'gridcolumn',
                stateId: 'lastModifiedDate',
                dataIndex: 'lastModifiedDate',
                text: 'Last Modified',
                minWidth: 120,
                flex: 1,
                hideable: true,
                hidden: true
            }*/,
            {
                xtype: 'gridcolumn',
                stateId: 'productUsage',
                dataIndex: 'productUsage',
                text: 'Product Usage',
                minWidth: 120,
                hideable: true,
                hidden: true,
                flex: 1,
            }
        ];

    },

    // list of actions to put in action column and context menu;
    getActionItems: function() {
        var me = this,
            actions = [];
        return actions;

    },

    onActionMenuShow: Ext.emptyFn,

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