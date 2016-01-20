/**
 * @class Taco.view.priceList.Grid
*/
Ext.define('Taco.view.priceList.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.PriceList',
        'Taco.store.PriceLists',
        'Ext.Date',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.view.priceList.form.AdvancedSearch',
        //'Taco.view.priceList.modal.priceListEditor',
        'Taco.view.priceList.Form',
        'Taco.view.priceList.Edit'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m']
    },

    launchEditorOnClick: true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.PriceList',

    controllerName: 'PriceLists',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: 'Create New Price List',

    showActionsColumn: true,

    enableEditAction: true,
    enableDeleteAction:true,

    hideSearchToolbar: false,

    title: 'Price Lists',

    store: null,

    autoScroll: true,

    enableQuickFilters: false,

    deletePromptMsg : 'Are you sure you want to delete this price list?',

    pageSize: 25,

    advancedSearchConfig : {
        form: null, //set below
        quickFilterData: [
            [{ code: 'Code' }, 'Code']
        ],
        emptySearchText: 'Search'
    },

    onCreate: Ext.emptyFn,
    isDisabled: false,

    stateful: true,
    stateId: 'statefulPriceListGrid',

    statics: {

    },


    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();

        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);

        me.mon(Taco.app, 'pricelistcreated', me.reloadGrid, me);

        me.store = Taco.core.data.StoreManager.getOrCreate({
            type: 'Taco.store.PriceLists',
            createOnly: true,
            pageSize: this.pageSize,
            autoLoad: true,
            clearFilters: true,
            remoteFilter: true
        });

        me.advancedSearchConfig.form = Ext.create('Taco.view.priceList.form.AdvancedSearch', {});

        me.callParent(arguments);

    },

    reloadGrid: function() {
        this.store.reload();
    },

    getColumnConfig: function () {
        var columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'code',
                stateId: 'code',
                text: 'Code',
                hideable: true,
                flex: 1,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                hideable: false,
                flex: 2,                
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'catalogsJoined',
                stateId: 'catalogsJoined',
                text: 'Catalogs',
                hideable: true,
                flex: 3,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'customerSegmentsJoined',
                stateId: 'customerSegmentsJoined',
                text: 'Customer Segments',
                hideable: true,
                flex: 3,
                sortable: false
            }
        ];
        //if (includeSiteColumn) {
        //    columns.push({
        //        xtype: 'gridcolumn',
        //        dataIndex: 'siteName',
        //        stateId: 'siteName',
        //        text: 'Site',
        //        hideable: true,
        //        flex: 1,
        //        sortable: false
        //    });
        //}
        return columns.concat([
            {
                xtype: 'gridcolumn',
                dataIndex: 'active',
                stateId: 'active',
                text: 'Active',
                flex:1,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'createDate',
                stateId: 'createDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Created Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'createByUser',
                stateId: 'createByUser',
                text: 'Created By',
                flex:1,
                hidden: true,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'lastModifiedDate',
                stateId: 'lastModifiedDate',
                format: 'n/j/Y g:i a',
                flex:2,
                text: 'Last Modified Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'lastModifiedByUser',
                stateId: 'lastModifiedByUser',
                text: 'Last Modified By',
                flex:1,
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
                //    model: 'Taco.model.PriceList' //,
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
                //    model: 'Taco.model.PriceList',
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

        Ext.defer(function () {
            if (!isNew) {
                Taco.core.StateManager.attemptNavigate('priceLists/edit/' + record.getId(), {}); //{complexMetaData: {record: record}});
            } else {
                Taco.core.StateManager.attemptNavigate('priceLists/create', {});
            }
        }, 1, this);
        return;
    },

    doCreate : function (){
        this.openEditor(null, true);
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    },

    disablePriceLists: function () {
        var createActionButton = Ext.ComponentQuery.query('button[itemId=createActionButton]');
        if (createActionButton && createActionButton.length > 0) {
            createActionButton[0].setDisabled(true);
        }
        var advFilterButton = Ext.ComponentQuery.query('button[itemId=advancedFilter]');
        if (advFilterButton && advFilterButton.length > 0) {
            advFilterButton[0].setDisabled(true);
        }
    }

});