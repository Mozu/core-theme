/**
 * @class Taco.view.couponSet.Grid
*/
Ext.define('Taco.view.couponSet.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.CouponSet',
        'Taco.store.CouponSetGrid',
        'Taco.view.couponSet.AdvancedSearchForm',
        'Ext.Date',
        'Taco.store.TargetedShippingMethods',
        'Ext.form.Panel',
        'Taco.core.ux.BaseGrid',
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.view.discount.Edit',
        'Taco.core.ux.FilterableDataView',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn',
        'Taco.store.TargetedShippingMethods',
        'Taco.view.couponSet.AdvancedSearchForm',
        'Taco.view.couponSet.modal.CouponSetEditor',
        'Taco.view.discount.Edit'
    ],

    mixins: {
        deleteFromGrid: 'Taco.core.ux.mixins.DeleteFromGrid'
    },

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },


    launchEditorOnClick:true,

    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.CouponSet',

    controllerName: 'CouponSets',

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

    createButtonText: "Create New Coupon Set",

    showActionsColumn: true,

    enableEditAction: true,
    enableDeleteAction:true,

    hideSearchToolbar: false,

    title: "Coupon Sets",

    store: { type: 'Taco.store.CouponSetGrid' },

    autoScroll: true,

    enableQuickFilters:false,

    deletePromptMsg : "If a coupon set is currently active, deleting it could affect pending orders and carts.<br/>Are you sure you want to delete this?",

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.couponSet.AdvancedSearchForm',

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
    stateId: 'statefulCouponSetGrid',

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
                dataIndex: 'name',
                stateId: 'name',
                text: 'Name',
                hideable: false,
                flex: 1,
                minWidth: 150,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'couponCodeType',
                stateId: 'couponCodeType',
                text: 'Type',
                width: 150,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'countOrSetSize',
                stateId: 'countOrSetSize',
                text: 'Total Codes',
                width: 180,
                hidden: false,
                sortable: false,
                renderer: Ext.util.Format.numberRenderer('0,000')
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'redemptionCount',
                stateId: 'redemptionCount',
                text: '# Redeemed',
                width: 180,
                hidden: false,
                sortable: false,
                renderer: Ext.util.Format.numberRenderer('0,000')
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'redemptionPercent',
                stateId: 'redemptionPercent',
                text: '% Redeemed',
                width: 180,
                hidden: false,
                sortable: false,
                renderer: Ext.util.Format.numberRenderer('0.00 %')
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'assignedDiscountCount',
                stateId: 'assignedDiscountCount',
                text: '# of Assigned Discounts',
                width: 180,
                hidden: false,
                sortable: false,
                renderer: Ext.util.Format.numberRenderer('0,000')
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'couponSetCode',
                stateId: 'couponSetCode',
                text: 'Code Prefix',
                width: 180,
                hidden: true,
                sortable: true
            }, {
                xtype: 'datecolumn',
                dataIndex: 'startDate',
                stateId: 'startDate',
                format: 'n/j/Y g:i a',
                width: 130,
                text: 'Start Date',
                hidden: true,
                sortable: true
            }, {
                xtype: 'datecolumn',
                dataIndex: 'endDate',
                stateId: 'endDate',
                format: 'm-d-Y g:i a',
                width: 130,
                text: 'End Date',
                hidden: true,
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
                dataIndex: 'maxRedemptionsPerCouponCode',
                stateId: 'maxRedemptionsPerCouponCode',
                text: 'Max Redemptions per Code',
                width: 180,
                hidden: true,
                sortable: true
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'maxRedemptionsPerUser',
                stateId: 'maxRedemptionsPerUser',
                text: 'Max Redemptions per Customer',
                width: 210,
                hidden: true,
                sortable: true
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
                    model: 'Taco.model.CouponSet',
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
                    model: 'Taco.model.CouponSet',
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
            this.openEditor(record, record.get('couponSetType'), false);
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

        Ext.create('Taco.view.couponSet.modal.CouponSetEditor', {
            // if we want to edit a draft only, pass recordId.
            // otherwise, pass the record.

            record: record,
            createType: couponSetType,
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
                                        return
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