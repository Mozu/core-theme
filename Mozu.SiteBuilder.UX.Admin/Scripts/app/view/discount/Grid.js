/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.discount.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    //cls: Taco.baseCSSPrefix + 'searchlist',

    requires: [
        'Taco.model.Discount',
        'Taco.store.DiscountGrid',
        'Taco.view.discount.AdvancedSearchForm',
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
        supportedLevels: ['c'],
        requiresContextOfType: ['c', 's']
    },

    launchEditorOnClick:true,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.Discount',

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

    createButtonText: "Create New Discount",

    showActionsColumn: true,
    enableEditAction: true,
    enableDuplicateAction: true,
    enableDeleteAction: true,

    hideSearchToolbar: false,
    
    title: "Discounts",

    store: { type: 'Taco.store.DiscountGrid' },  

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.discount.AdvancedSearchForm',
        
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

    stateful: false,
    stateId: null,

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
        
        me.callParent(arguments);
    },
    
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [
                {
                    //xtype: 'gridcolumn',
                    dataIndex: 'name',
                    stateId: 'name',
                    text: 'Name',
                    hideable: false,
                    flex: 1,
                    minWidth: 150
                    //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                    //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                    //}
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'amountType',
                    stateId: 'amountType',
                    text: 'Type',
                    width: 150,
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var retVal = "";
                        switch (value) {
                        case "Percentage":
                            retVal = record.get("amount") + "% OFF";
                            break;
                        case "Amount":
                            retVal = Taco.app.context.getCurrent().formatCurrency(record.get("amount")) + " OFF";
                            break;
                        case "Free":
                            retVal = "Free";
                            break;
                        case "FixedPrice":
                            retVal = "Fixed: " + Taco.app.context.getCurrent().formatCurrency(record.get("amount"));
                            break;
                        }

                        return retVal;
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'target',
                    stateId: 'appliesTo',
                    text: 'Applies To',
                    width: 180,
                    hidden: false,
                    sortable: false,
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {
                        var val = "",
                            cats = record.get("categories").length,
                            prods = record.get("products").length;

                        if (record.get('includeAllProducts')) {
                            val = "All products";
                        } else {
                            if (prods) {
                                val = prods + ((prods > 1) ? " Products" : " Product");
                            }

                            if (cats) {
                                val += (val ? " &amp; " : Ext.emptyString) + cats + ((cats > 1) ? " Categories" : " Category");
                            }
                        }

                        if (record.get("targetType") == "Order") {
                            val += " Min. Order (" + Taco.app.context.getCurrent().formatCurrency(record.get("minimumOrderAmount")) + ")";
                        }

                        if (val === '') {
                            val = 'Nothing';
                        }

                        return val;
                    }
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'startDate',
                    stateId: 'startDate',
                    format: 'n/j/Y g:i a',
                    width: 130,
                    text: 'Start Date'
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'expirationDate',
                    stateId: 'expirationDate',
                    format: 'm-d-Y g:i a',
                    width: 130,
                    text: 'End Date',
                    renderer: function(value, metaData, record, rowIndex, colIndex, store) {

                        var val = "";

                        if (!record.get("expirationDate")) {
                            val = "Never";
                            return val;
                        }

                        return Ext.Date.format(value, "n/j/Y g:i a");
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'status',
                    stateId: 'status',
                    text: 'Status',
                    sortable: false
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'couponCode',
                    stateId: 'couponCode',
                    text: 'Coupon Code',
                    width: 130,
                    hidden: false,
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                        if (record.get("requiresCoupon") && Ext.isEmpty(record.get("couponCode"))) {
                            return "Multiple Codes";
                        };
                        return value;
                    }
                }, {
                    xtype: 'numbercolumn',
                    dataIndex: 'currentRedemptionCount',
                    stateId: 'currentRedemptionCount',
                    format: "0",
                    text: 'Used',
                    width: 80,
                    hidden: false
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
                itemId: "deleteMenuItem",
                // deleteMenuColumnHandler can be found in Taco.core.ux.mixins.DeleteFromGrid
                menuColumnHandler: "deleteMenuColumnHandler",
                requiredBehaviors: {
                    model: 'Taco.model.Discount',
                    behavior: 'delete'
                },
                scope: me
            });
        }

        return actions;

    },

    onActionMenuShow: function (menu, eventData) {
        var me = this;

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

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('discounts/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doCreate : function (){
        var controller = "discounts"
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },


    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    },

    getDeletePromptMessage: function (record) {
        return record.getDeletePromptMessage();
    }

});