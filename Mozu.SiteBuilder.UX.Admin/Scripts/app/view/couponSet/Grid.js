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
        'Taco.core.ux.grid.MenuColumn'
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
    createButtonCfg: {
        menuAlign: 'tr-br?',
        menu: {
            plain: true,
            shadow: false,
            items: [
                {
                    text: 'Manual Coupon Set',
                    //requiredBehaviors: {
                    //    model: 'Taco.model.Discount',
                    //    behavior: 'create'
                    //},
                    listeners: {
                        click: {
                            scope: this,
                            fn: function() {
                                console.log("manual");
                            }
                        }
                    }
                }, {
                    text: 'Generated Coupon Set',
                    //requiredBehaviors: {
                    //    model: 'Taco.model.Discount',
                    //    behavior: 'create'
                    //},
                    listeners: {
                        click: {
                            scope: this,
                            fn: function() {
                                console.log("generated");
                            }
                        }
                    }
                }
            ]
        }
    },

    createButtonText: "Create New Coupon Set",

    showActionsColumn: true,

    hideSearchToolbar: false,
    
    title: "Coupon Sets",

    store: { type: 'Taco.store.CouponSetGrid' },

    autoScroll: true,

    enableQuickFilters:false,

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

        this.columns = this.getColumnConfig();

        // initialize the delete mixin
        this.mixins.deleteFromGrid.init.apply(this);
        
        me.callParent(arguments);
    },
    
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
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
                dataIndex: 'couponCodeCount',
                stateId: 'couponCodeCount',
                text: 'Total Codes',
                width: 180,
                hidden: false,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'redemptionCount',
                stateId: 'redemptionCount',
                text: '# Redeemed',
                width: 180,
                hidden: false,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'redemptionPercent',
                stateId: 'redemptionPercent',
                text: '% Redeemed',
                width: 180,
                hidden: false,
                sortable: false
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'assignedDiscountCount',
                stateId: 'assignedDiscountCount',
                text: '# of Assigned Discounts',
                width: 180,
                hidden: false,
                sortable: false
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
                renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    var val = "";
                    if (!record.get("endDate")) {
                        val = "Never";
                        return val;
                    }
                    return Ext.Date.format(value, "n/j/Y g:i a");
                }
            }, {
                xtype: 'taco.menucolumn',
                text: 'Actions',
                onMenuShow: function (menu, eventData) {
                    // need to disable the delete menu option when discount has been used
                    var deleteMenuItem = menu.down("#deleteMenuItem");
                    if (eventData.record.get('canBeDeleted')) {
                        deleteMenuItem.show();
                    } else {
                        deleteMenuItem.hide();
                    }
                },
                //flex: 1,
                menuItems: [
                    {
                        text: 'Edit',
                        requiredBehaviors: {
                            model: 'Taco.model.Discount',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            var record = eventData.record;
                            Ext.defer(function () {
                                Taco.core.StateManager.attemptNavigate(me.controllerName + '/edit/' + record.getId(), {complexMetaData: {record: record}});
                            }, 1, this);
                        }
                    }, {
                        text: 'Delete',
                        itemId: "deleteMenuItem",
                        // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                        menuColumnHandler: "deleteMenuColumnHandler",
                        requiredBehaviors: {
                            model: 'Taco.model.Discount',
                            behavior: 'delete'
                        },
                        scope: me
                    }
                ]
            }
        ];
    },

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState(this.controllerName + '/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doCreate : function (){
        Taco.app.StateManager.attemptNavigate(this.controllerName + '/create');
    },

    launchEditor: function (record) {
        var me = this;
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate(me.controllerName + '/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    }

});