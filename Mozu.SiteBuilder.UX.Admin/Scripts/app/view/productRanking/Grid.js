/**
 * @class Taco.view.productRanking.Grid
*/
Ext.define('Taco.view.productRanking.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.ProductRanking',
        'Taco.store.ProductRankings',
        'Ext.Date',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.view.productRanking.form.AdvancedSearch',
        'Taco.view.productRanking.modal.ProductRankingEditor',
        'Taco.view.productRanking.Form',
        'Taco.view.productRanking.Edit'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s'] //'c',
    },

    launchEditorOnClick:true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.ProductRanking',

    controllerName: 'ProductRankings',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: 'Create New Rule',

    showActionsColumn: true,

    enableEditAction: true,
    enableDeleteAction:true,

    hideSearchToolbar: false,

    title: 'Product Ranking Rules',

    store: null,

    autoScroll: true,

    enableQuickFilters:false,

    deletePromptMsg : 'Are you sure you want to delete this product ranking rule?',

    isCatalogLevel: false,
    categoryCode: null,
    pageSize: 25,
    isPopUp: false,

    advancedSearchConfig : {
        form: null, //set below
        quickFilterData: [
            [{ code: 'Code' }, 'Code'],
            [{ status: 'Status' }, 'Status']
        ]
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulProductRankingGrid',

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

        me.mon(Taco.app, 'productrankingrulecreated', me.reloadGrid, me);

        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.ProductRankings',
            createOnly: true,
            pageSize: this.pageSize,
            autoLoad: false,
            clearFilters: true,
            remoteFilter: true
        });
        if (me.categoryCode) {
            me.store.proxy.extraParams = this.store.proxy.extraParams || {};
            me.store.proxy.extraParams.categoryCode = me.categoryCode;
        } else {
            me.store.proxy.extraParams = {};
        }
        if (!this.isCatalogLevel || this.categoryCode) {
            me.store.load();
        }

        me.advancedSearchConfig.form = Ext.create('Taco.view.productRanking.form.AdvancedSearch', {
            isCatalogLevel: me.isCatalogLevel
        });

        me.callParent(arguments);
    },

    reloadGrid: function() {
        this.store.reload();
    },

    getColumnConfig: function (includeSiteColumn) {
        var columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'code',
                stateId: 'code',
                text: 'Code',
                hideable: true,
                //flex: 1,
                minWidth: 75,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                hideable: false,
                flex: 1,
                minWidth: 250,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'keywordsJoined',
                stateId: 'keywordsJoined',
                text: 'Search Keywords',
                hideable: true,
                //flex: 1,
                minWidth: 150,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'categoryNamesJoined',
                stateId: 'categoryNamesJoined',
                text: 'Categories',
                hideable: true,
                //flex: 1,
                minWidth: 150,
                sortable: false
            }
        ];
        if (includeSiteColumn) {
            columns.push({
                xtype: 'gridcolumn',
                dataIndex: 'siteName',
                stateId: 'siteName',
                text: 'Site',
                hideable: true,
                //flex: 1,
                minWidth: 75,
                sortable: false
            });
        }
        return columns.concat([
            {
                xtype: 'gridcolumn',
                dataIndex: 'status',
                stateId: 'status',
                text: 'Status',
                width: 75,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'startDate',
                stateId: 'startDate',
                format: 'n/j/Y g:i a',
                width: 125,
                text: 'Active Start Date',
                hidden: false,
                sortable: true
            }, {
                xtype: 'datecolumn',
                dataIndex: 'endDate',
                stateId: 'endDate',
                format: 'm-d-Y g:i a',
                width: 125,
                text: 'Active End Date',
                hidden: false,
                sortable: true,
                renderer: function (value, metaData, record) {
                    var val = '';
                    if (!record.get('endDate')) {
                        val = 'Never';
                        return val;
                    }
                    return Ext.Date.format(value, 'n/j/Y g:i a');
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'isDefault',
                stateId: 'isDefault',
                text: 'Default',
                width: 750,
                hidden: true,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'createDate',
                stateId: 'createDate',
                format: 'n/j/Y g:i a',
                width: 75,
                text: 'Created Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'createByUser',
                stateId: 'createByUser',
                text: 'Created By',
                width: 75,
                hidden: true,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'lastModifiedDate',
                stateId: 'lastModifiedDate',
                format: 'n/j/Y g:i a',
                width: 75,
                text: 'Last Modified Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'lastModifiedByUser',
                stateId: 'lastModifiedByUser',
                text: 'Last Modified By',
                width: 75,
                hidden: true,
                sortable: false
            }
        ]);
    },

    // list of actions to put in action column and context menu;
    getActionItems: function () {
        var me = this,
            actions = [];

        if (this.enableEditAction) {
            actions.push({
                text: 'Edit',
                //requiredBehaviors: {
                //    model: 'Taco.model.ProductRanking' //,
                //    //behavior: 'update'
                //},
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
                //requiredBehaviors: {
                //    model: 'Taco.model.ProductRanking',
                //    //behavior: 'delete'
                //},
                scope: me
            });
        }

        return actions;

    },

    onActionMenuShow: function (menu, eventData) {

        //todo: set delete message based on categories? greg_murray on 10/16/2015

        // need to disable the delete menu option when discount has been used
        //var deleteMenuItem = menu.down("#deleteMenuItem");
        //if (deleteMenuItem) {
        //    if (eventData.record.get('canBeDeleted')) {
        //        deleteMenuItem.show();
        //    } else {
        //        deleteMenuItem.hide();
        //    }
        //}
    },

    getActionColumn: function () {
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
    },

    launchEditor: function (record) {
        Ext.defer(function () {
            this.openEditor(record, false);
        }, 1, this);
    },

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.openEditor(record, record.get('code'), false);
            //this.doEdit(record, e);
            //this.launchEditor(record);
            //Taco.app.StateManager.addState(this.controllerName + '/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doEdit : function (item, eventData) {
        var rec = eventData.record;
        item.scope.openEditor(rec, false);
    },

    openEditor: function (record, isNew) {
        var me = this;

        if (!me.isPopUp) {
            Ext.defer(function () {
                if (!isNew) {
                    Taco.core.StateManager.attemptNavigate('ProductRankings/edit/' + record.getId(), {}); //{complexMetaData: {record: record}});
                } else {
                    Taco.core.StateManager.attemptNavigate('ProductRankings/create', {});
                }
            }, 1, this);
            return;
        }

        Ext.create('Taco.view.productRanking.modal.ProductRankingEditor', {
            record: record,
            isCreateMode: isNew,
            categoryCode: (isNew) ? me.categoryCode : null,
            listeners: {
                savesuccess: function () {
                    if (me.store.proxy.extraParams.id) {
                        delete me.store.proxy.extraParams.id;
                    }
                    me.store.reload();
                }
            }
        });
    },

    doCreate : function (){
        this.openEditor(null, true);
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    }

});