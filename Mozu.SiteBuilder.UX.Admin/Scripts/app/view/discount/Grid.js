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

    enableAutoSelect: false,

    //contextConfig: {
    //    supportedLevels: ['c'],
    //    requiresContextOfType: ['c', 's']
    //},

    contextConfig: {
        supportedLevels: ['s'],
        requiresContextOfType: ['s']
    },

    launchEditorOnClick:true,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.Discount',

    enableNavHeader: true,

    // adds the "taco-content-navcontainer-padding" class
    // Will add the 20px padding needed for display in the contentView as part of the NavHeader code;
    addContentViewPadding: true,

    enableSearch: false,
    enablePaging: true,
    enableRowEditing: false,
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
            // Entries should be query and display value pairs formatted as follows:
            //[{ prop: 'value' }, 'Title'],
            //[{ prop: 'value' }, 'Title']
        ],

        emptySearchText: 'Search'
    },

    onCreate: Ext.emptyFn,

    stateful: false,
    stateId: null,
    statics: {},
        
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
                   }, {
                    dataIndex: 'friendlyDescription',
                    stateId: 'friendlyDescription',
                    text: 'Description',
                    hideable: true,
                    hidden: true,
                    sortable: false,
                    flex: 1,
                    renderer: function(value) {
                        var txt = Ext.util.Format.ellipsis(Ext.util.Format.stripTags(value), 100, true);
                        return txt;
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'amountType',
                    stateId: 'amountType',
                    text: 'Type',
                    width: 150,
                    flex: 1,
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
                            case "FreeAutoAdd":
                                retVal = "Auto-add";
                                break
                        }


                        return retVal;
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'target',
                    stateId: 'appliesTo',
                    text: 'Applies To',
                    width: 180,
                    flex: 1,
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
                    flex: 1,
                    text: 'Start Date'
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'expirationDate',
                    stateId: 'expirationDate',
                    format: 'm-d-Y g:i a',
                    width: 130,
                    flex: 1,
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
                    flex: 1,
                    sortable: false
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'couponCode',
                    stateId: 'couponCode',
                    text: 'Coupon Code',
                    width: 130,
                    flex: 1,
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
                    flex: 1,
                    width: 80,
                    hidden: false
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'createDate',
                    stateId: 'createDate',
                    format: 'n/j/Y g:i a',
                    flex: 2,
                    text: 'Created Date',
                    hidden: true,
                    sortable: true
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'createByUser',
                    stateId: 'createByUser',
                    text: 'Created By',
                    flex: 1,
                    hidden: true,
                    sortable: false
                }, {
                    xtype: 'datecolumn',
                    dataIndex: 'lastModifiedDate',
                    stateId: 'lastModifiedDate',
                    format: 'n/j/Y g:i a',
                    flex: 2,
                    text: 'Last Modified Date',
                    hidden: true,
                    sortable: true
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'lastModifiedByUser',
                    stateId: 'lastModifiedByUser',
                    text: 'Last Modified By',
                    flex: 1,
                    hidden: true,
                    sortable: false
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