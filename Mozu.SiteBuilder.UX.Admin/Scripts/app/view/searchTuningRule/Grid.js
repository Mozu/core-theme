/**
 * @class Taco.view.searchTuningRule.Grid
*/
Ext.define('Taco.view.searchTuningRule.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.SearchTuningRule',
        'Taco.store.SearchTuningRules',
        'Ext.Date',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.view.searchTuningRule.AdvancedSearchForm',
        'Taco.view.searchTuningRule.modal.SearchTuningRuleEditor'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    
    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['c', 's']
    },

    launchEditorOnClick:true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.SearchTuningRule',

    controllerName: 'SearchTuningRules',

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

    createButtonText: "Create New Search Tuning Rule",

    showActionsColumn: true,

    enableEditAction: true,
    enableDeleteAction:true,

    hideSearchToolbar: false,

    title: "Search Tuning Rules",

    store: { type: 'Taco.store.SearchTuningRules' },

    autoScroll: true,

    enableQuickFilters:false,

    deletePromptMsg : "Are you sure you want to delete this search tuning rule?",

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.searchTuningRule.AdvancedSearchForm',

        quickFilterData: [
            [{ orderStatus: 'Open' }, 'Open Orders'],
            [{ paymentstatus: 'Unpaid', orderStatus: 'Open' }, 'Unpaid Orders'],
            [{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            [{ orderStatus: 'Pending', ordertype: 'Offline' }, 'Pending Orders'],
            [{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            [{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            [{ orderStatus: 'Errored' }, 'Errored Orders'],
            [{}, 'All Orders']
        ]
    },

    onCreate: Ext.emptyFn,

    stateful: true,
    stateId: 'statefulSearchTuningRuleGrid',

    statics: {

    },


    initComponent: function () {
        var me = this;

        me.createButtonCfg = me.getCreateButtonConfig();

        this.columns = this.getColumnConfig();

        if (this.showActionsColumn) {
            var actionColumn = this.getActionColumn();
            if (actionColumn) {
                this.columns.push(actionColumn);
            }
        }

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);

        me.callParent(arguments);
    },

    getColumnConfig: function () {
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'code',
                stateId: 'code',
                text: 'Code',
                hideable: false,
                //flex: 1,
                minWidth: 50,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                hideable: false,
                flex: 1,
                minWidth: 150,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'status',
                stateId: 'status',
                text: 'Status',
                width: 50,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'startDate',
                stateId: 'startDate',
                format: 'n/j/Y g:i a',
                width: 50,
                text: 'Start Date',
                hidden: false,
                sortable: true
            }, {
                xtype: 'datecolumn',
                dataIndex: 'endDate',
                stateId: 'endDate',
                format: 'm-d-Y g:i a',
                width: 50,
                text: 'End Date',
                hidden: false,
                sortable: true,
                renderer: function (value, metaData, record) {
                    var val = "";
                    if (!record.get("endDate")) {
                        val = "Never";
                        return val;
                    }
                    return Ext.Date.format(value, "n/j/Y g:i a");
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'isDefault',
                stateId: 'isDefault',
                text: 'Default',
                width: 50,
                hidden: false,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'createDate',
                stateId: 'createDate',
                format: 'n/j/Y g:i a',
                width: 50,
                text: 'Created Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'createdBy',
                stateId: 'createdBy',
                text: 'Created By',
                width: 50,
                hidden: true,
                sortable: false
            }, {
                xtype: 'datecolumn',
                dataIndex: 'modifiedDate',
                stateId: 'modifiedDate',
                format: 'n/j/Y g:i a',
                width: 50,
                text: 'Last Modified Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'modifiedBy',
                stateId: 'modifiedBy',
                text: 'Last Modified By',
                width: 50,
                hidden: true,
                sortable: false
            }
        ];

    },

    // list of actions to put in action column and context menu;
    getActionItems: function () {
        var me = this,
            actions = [];

        if (this.enableEditAction) {
            actions.push({
                text: 'Edit',
                requiredBehaviors: {
                    model: 'Taco.model.SearchTuningRule',
                    behavior: 'update'
                },
                menuColumnHandler: me.doEdit,
                scope:me
            });
        }


        if (this.enableDeleteAction) {
            actions.push({
                text: 'Delete',
                itemId: "deleteMenuItem",
                // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                menuColumnHandler: "deleteMenuColumnHandler",
                requiredBehaviors: {
                    model: 'Taco.model.SearchTuningRule',
                    behavior: 'delete'
                },
                scope: me
            });
        }

        return actions;

    },

    onActionMenuShow: function (menu, eventData) {
        // need to disable the delete menu option when discount has been used
        var deleteMenuItem = menu.down("#deleteMenuItem");
        if (deleteMenuItem) {
            if (eventData.record.get('canBeDeleted')) {
                deleteMenuItem.show();
            } else {
                deleteMenuItem.hide();
            }
        }
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
            }
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
            this.openEditor(record, record.get('couponSetType'), false);
            //this.doEdit(record, e);
            //this.launchEditor(record);
            //Taco.app.StateManager.addState(this.controllerName + '/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doEdit : function (item, eventData) {
        var rec = eventData.record;
        item.scope.openEditor(rec, rec.get('couponSetType'), false);
    },

    openEditor: function (record, couponSetType, isNew) {
        var me = this;

        Ext.create('Taco.view.searchTuningRule.modal.SearchTuningRuleEditor', {
            // if we want to edit a draft only, pass recordId.
            // otherwise, pass the record.

            record: record,
            createType: 'searchRule',
            isCreateMode: isNew,

            listeners: {
                savesuccess: function() {
                  me.store.reload();
                }
            }
        });
    },

    doCreate : function (couponSetType){
        if (!couponSetType) return;
        this.openEditor(null, couponSetType, true);
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    },

    getCreateButtonConfig: function () {
        var me = this;
        return {
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                shadow: false,
                items: [
                    {
                        text: 'Manual Coupon Set',
                        requiredBehaviors: {
                            model: 'Taco.model.CouponSet',
                            behavior: 'create'
                        },
                        listeners: {
                            click: {
                                fn: function (menu, menuItem) {
                                    if (!menuItem) {
                                        return;
                                    }
                                    ////var context= menuItem.context;
                                    //var siteId = menuItem.siteId;
                                    //// set the context to the siteId of the selected store;
                                    //var context = Taco.app.context.getStore().findRecord('id', siteId).raw
                                    //Taco.app.context.setCurrentContext(context);
                                    //create the
                                    me.doCreate('Manual');

                                },
                                scope: me,
                                delegate: "x-menu-item-link"
                            }
                        }
                    }, {
                        text: 'Generated Coupon Set',
                        requiredBehaviors: {
                            model: 'Taco.model.CouponSet',
                            behavior: 'create'
                        },
                        listeners: {
                            click: {
                                fn: function (menu, menuItem) {
                                    if (!menuItem) {
                                        return
                                    }
                                    ////var context= menuItem.context;
                                    //var siteId = menuItem.siteId;
                                    //// set the context to the siteId of the selected store;
                                    //var context = Taco.app.context.getStore().findRecord('id', siteId).raw
                                    //Taco.app.context.setCurrentContext(context);
                                    //create the
                                    me.doCreate('Generated');
                                },
                                scope: me,
                                delegate: "x-menu-item-link"
                            }
                        }
                    }
                ]
            }
        }
    }

});