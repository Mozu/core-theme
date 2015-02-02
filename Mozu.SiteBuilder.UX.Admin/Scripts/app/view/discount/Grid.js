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

    enableSearch: true,
    enablePaging: true,
    enableRowEditing: false,
    enableAutoSelect: true,
    createButtonEnabled: true,
    saveButtonEnabled: false,
    cancelButtonEnabled: false,

    createButtonText: "Create New Discount",

    showActionsColumn: true,

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

    stateful: true,
    stateId: 'statefulDiscountGrid',

    statics: {
        
    },
        
    initComponent: function () {
        var me = this;

        this.columns = this.getColumnConfig();
        
        me.callParent(arguments);
    },
    
    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [
                {
                    xtype: 'gridcolumn',
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
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {

                        // percentage
                        if (value == "Percentage") {
                            return record.get("amount") + "% OFF";
                        }

                        // amount
                        if (value == "Amount") {
                            return Taco.app.context.getCurrent().formatCurrency( record.get("amount") ) + " OFF";
                        }

                        // freeShipping
                        if (value == "Free") {
                            return "Free";
                        }

                        return Ext.emptyString;
                    }
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'target',
                    stateId: 'appliesTo',
                    text: 'Applies To',
                    width: 180,
                    hidden: false,
                    sortable:false,
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {
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
                    renderer: function (value, metaData, record, rowIndex, colIndex, store) {

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
                    hidden: false
                }, {
                    xtype: 'numbercolumn',
                    dataIndex: 'currentRedemptionCount',
                    stateId: 'currentRedemptionCount',
                    format: "0",
                    text: 'Used',
                    width: 80,
                    hidden: false
                },{
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
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
                                    Taco.core.StateManager.attemptNavigate('discounts/edit/' + record.getId(), { complexMetaData: { record: record } });
                                }, 1, this);
                            }
                        },{
                            text: 'Duplicate',
                            requiredBehaviors: {
                                model: 'Taco.model.Discount',
                                behavior: 'create'
                            },
                            menuColumnHandler: function (item, eventData) {
                                var record = eventData.record,
                                    metaData = {
                                        id: record.getId()
                                    };

                                Taco.app.StateManager.attemptNavigate('discounts/duplicate/' + record.getId(), metaData);
                            }
                        }
                    ]
                }
                /*

                // BUG:  15695
                // http://tfs.ads.volusion.com:8080/tfs/VNext/Mozu/_workitems/edit/15695
                // (Simeon K.) delete of discounts causes orders that had that discount to spontaneously combust. Poof! Removing delete action trigger until we have a better solution;

                , {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
                    menuItems:[{
                        text: 'Delete',
                        requiredBehaviors: {
                            model: 'Taco.model.Discount',
                            behavior:'destroy'
                        },
                        menuColumnHandler: 'destroyMenuColumnHandler'
                    }]
                }
                */
            ]
        
        
        

        return columns;
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
    }

});