/**
 * @class Taco.view.sortDefinition.Grid
*/
Ext.define('Taco.view.sortDefinition.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.SortDefinition',
        'Taco.store.SortDefinition',
        'Ext.Date',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s'] //'c',
    },

    launchEditorOnClick: false,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.SortDefinition',
    willDisableProductRankings: false,
    enableNavHeader: true,
    enableSearchBarInHeader: false,
    showTitleBorder: false,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: 'Create New Sort Definition',

    showActionsColumn: true,

    enableEditAction: true,
    enableDuplicateAction: false,
    enableDeleteAction: true,

    hideSearchToolbar: true,

    title: 'Sort Definitions',

    store: null,

    autoScroll: true,

    enableQuickFilters:false,

    deletePromptMsg : 'Are you sure you want to delete this sort definition?',

    isCatalogLevel: false,
    categoryCode: null,
    pageSize: 50,
    isPopUp: false,

    onCreate: Ext.emptyFn,
    isDisabled: false,

    stateful: true,
    stateId: 'statefulSortDefinitionGrid',

    statics: {

    },


    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig(me.isCatalogLevel);

        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);

        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.SortDefinition',
            createOnly: true,
            pageSize: this.pageSize,
            autoLoad: false,
            clearFilters: true,
            remoteFilter: true
        });

        if (me.categoryId) {
            me.store.proxy.extraParams = this.store.proxy.extraParams || {};
            me.store.proxy.extraParams.advancedSearch = JSON.stringify({
                categoryid: me.categoryId
            });
        } else {
            me.store.proxy.extraParams = {};
        }

        if (!this.isCatalogLevel || this.categoryId) {
            me.store.load();
        }

        this.mon(this, 'itemclick', this.onItemClick, this);

        if (this.willDisableProductRankings) {
            this.mon(me.store, 'load', me.disableProductRankings, me)
        }

        me.callParent(arguments);
    },

    //listeners: {
    //    afterrender: function () {
    //        this.disableProductRankings();
    //    }
    //},

    // TODO: define columns for sort definition grid
    getColumnConfig: function (includeSiteColumn) {
        var columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                hideable: false,
                flex: 2,
                sortable: true
            },
            {
                xtype: 'datecolumn',
                dataIndex: 'startDate',
                stateId: 'startDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Active Start Date',
                hidden: false,
                sortable: true
            },
            {
                xtype: 'datecolumn',
                dataIndex: 'endDate',
                stateId: 'endDate',
                format: 'm-d-Y g:i a',
                flex:2,
                text: 'Active End Date',
                hidden: false,
                sortable: true,
                renderer: function (value, metaData, record) {
                    var val = '';
                    if (!record.get('endDate')) {
                        val = 'Never';
                        return val;
                    }
                    return Ext.Date.format(new Date(value), 'n/j/Y g:i a');
                }
            }
        ];

        return columns;
    },

    // list of actions to put in action column and context menu;
    getActionItems: function () {
        var me = this,
            actions = [];

        if (this.enableEditAction) {
            actions.push({
                text: 'Edit',
                menuColumnHandler: me.doEdit,
                scope:me
            });
        }

        if (this.enableDeleteAction) {
            actions.push({
                text: 'Delete',
                itemId: 'deleteMenuItem',
                // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                menuColumnHandler: 'deleteMenuColumnHandler',
                scope: me
            });
        }

        return actions;
    },

    onActionMenuShow: function (menu, eventData) {},

    getActionColumn: function () {
        var me = this,
            actionColumn = null,
            actions = this.getActionItems();

        // as long as we have actions;
        if (actions.length) {
            actionColumn = {
                xtype: 'taco.menucolumn',
                onMenuShow: me.onActionMenuShow,
                menuItems: actions
            };
        }

        return actionColumn;
    },

    onItemClick: function (view, record, elm, index, e) {
        if (e.target.getAttribute('role') === 'button') {
            return;
        }

        Taco.core.StateManager.attemptNavigate(
            '/merchandising/edit/' + record.data.id + '?categoryId=' + this.categoryId,
            {}
        );
    },

    doEdit: function (item, eventData) {
        var rec = eventData.record.data;

        Taco.core.StateManager.attemptNavigate(
            '/merchandising/edit/' + rec.id + '?categoryId=' + this.scope.categoryId,
            {}
        );
    },

    doCreate: function() {
        Taco.app.StateManager.attemptNavigate(
            '/merchandising/create' + '?categoryId=' + this.categoryId,
            {}
        );
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    },

    disableProductRankings: function (me, records) {
        var toolbar = Ext.getCmp('product-rankings-grid').down('[cls~= navheader-action-toolbar]');
        if (toolbar) {
            var btn = toolbar.getRefItems()[0];
            if (btn && this.store.count() > 0) {
                btn.setTooltip("Cannot add Product Ranking Rules set with Sort Definitions.");
                btn.setDisabled(true);
            } else if (btn.isDisabled()) {
                btn.setTooltip("");
                btn.setDisabled(false);
            }
        }
    }
});
