/**
 * @class Taco.view.discount.Grid
*/
Ext.define('Taco.view.storeCredit.Grid', {
    extend: 'Taco.core.ux.browser.SearchList',
    
    requires: [
        'Taco.model.StoreCredit',
        'Taco.store.StoreCredits',
        'Taco.store.StoreCreditsGrid',
        'Taco.view.storeCredit.Edit',
        'Taco.view.storeCredit.AdvancedSearchForm',
        'Ext.Date',        
        'Ext.form.Panel',        
        'Ext.tip.QuickTipManager',
        'Taco.core.ux.TextFilter',
        'Taco.core.ux.grid.MenuColumn'
    ],
    
    launchEditorOnClick:true,
    
    // Required by mixin: Taco.core.ux.mixins.LaunchEditor defined in SearchList
    modelName: 'Taco.model.StoreCredit',

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

    createButtonText: "Create New Store Credit",

    showActionsColumn: true,

    hideSearchToolbar: false,

    enableActionColumn: true,

    excludeCustomerColumns:false,
    
    title: "Store Credits",

    store: { type: 'Taco.store.StoreCreditsGrid', autoLoad: true },

    autoScroll: true,

    enableQuickFilters:false,

    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.storeCredit.AdvancedSearchForm',
        
        quickFilterData: [
            //[{ orderStatus: 'Open' }, 'Open Orders'],
            //[{ paymentstatus: 'Unpaid', orderStatus: 'Open' }, 'Unpaid Orders'],
            //[{ paymentstatus: 'Paid', fulfillmentStatus: 'NotFulfilled' }, 'Paid, Pending Fulfillment Orders'],
            //[{ orderStatus: 'Pending', ordertype: 'Offline' }, 'Pending Orders'], 
            //[{ fulfillmentStatus: 'Fulfilled' }, 'Fulfilled Orders'],
            //[{ orderStatus: 'Cancelled' }, 'Cancelled Orders'],
            //[{ orderStatus: 'Errored' }, 'Errored Orders'],
            //[{}, 'All Orders']
        ]
    },

    onCreate: Ext.emptyFn,

    statics: {
        
    },
        
    initComponent: function () {
        var me = this;

        me.columns = me.getColumnConfig();

        if (me.adaptColumns) {
            me.adaptColumns(me.columns);
        }

        me.callParent(arguments);
    },
    
    // override the default visibility of the columns
    hiddenColumns: [],

    // override wether to include the columns; Allows for the column configurations to be reused but allows the subclass to control if they are available
    disabledColumns: [],

    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this,
            columns = [];

        columns.push({
            dataIndex: 'code',
            stateId: 'code',
            text: 'Code',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'creditType',
            stateId: 'creditType',
            text: 'Type',
            sortable: true,
            minWidth: 60
        }, {
            dataIndex: 'initialBalance',
            stateId: 'initialBalance',
            text: 'Issued Amount',
            renderer: function(value, metaData, record) {
                return Taco.app.context.formatCurrencyFromCode(record.get('currencyCode'), value);
            },
            width: 120
        }, {
            dataIndex: 'currentBalance',
            stateId: 'currentBalance',
            text: 'Current Balance',
            width: 120,
            sortable: true,
            renderer: function (value, metaData, record) {
                return Taco.app.context.formatCurrencyFromCode(record.get('currencyCode'), value);
            }
        },{
            dataIndex: 'activationDate',
            stateId: 'activationDate',
            text: 'Activation Date',
            width: 130,
            xtype: 'datecolumn',
            format: 'n/j/Y g:i a',
        }, {
            dataIndex: 'expirationDate',
            stateId: 'expirationDate',
            text: 'Expires On',
            width: 130,
            hidden: false,
            xtype: 'datecolumn',
            format: 'n/j/Y g:i a',
        });

        if (!this.excludeCustomerColumns) {
            columns.push({
                dataIndex: 'customer',
                stateId: 'customer',
                text: 'Customer',
                sortable: false,
                flex: 1,
                minWidth: 120,
                renderer: function (customer) {
                    if (customer) {
                        return '<span style="white-space:nowrap">' + customer.firstName + ' ' + customer.lastName + '(' + customer.id + ')</span>';
                    }
                }
            }, {
                dataIndex: 'customerId',
                stateId: 'customerId',
                text: 'Customer Id',
                flex: 1,
                minWidth: 120,
                hidden: true
            }, {
                dataIndex: 'customer',
                stateId: 'customerEmail',
                text: 'Customer Email',
                sortable: false,
                flex: 1,
                minWidth: 120,
                hidden: true,
                renderer: function (customer) { return customer.emailAddress; }
            });
        }
        
        columns.push({
            dataIndex: 'createdDate',
            stateId: 'createdDate',
            text: 'Create Date',
            width: 130,
            hidden: true,
            sortable: true,
            getSortParam: function() {
                return "createdate";
            },
            xtype: 'datecolumn',
            format: 'n/j/Y g:i a',
        }, {
            dataIndex: 'modifiedDate',
            stateId: 'modifiedDate',
            text: 'Update Date',
            width: 130,
            hidden: true,
            sortable: true,
            getSortParam: function() {
                return "updatedate";
            },
            xtype: 'datecolumn',
            format: 'n/j/Y g:i a',
        }, {
            dataIndex: 'updateBy',
            stateId: 'updateBy',
            text: 'Updated By',
            width: 130,
            hidden: true,
            sortable: false,
            renderer: function(val, creditRecord) {
                var store = Taco.core.data.StoreManager.getOrCreate('Taco.store.AdminUsers');
                var rec = store.getById(val);
                var name = "";
                if (rec) {
                    name = rec.get("fullName");
                } else {
                    name = "system";
                }
                return name;
            }
        }, {
            dataIndex: 'createBy',
            stateId: 'createBy',
            text: 'Created By',
            width: 130,
            hidden: true,
            sortable: false,
            renderer: function(val, creditRecord) {
                var store = Taco.core.data.StoreManager.getOrCreate('Taco.store.AdminUsers');
                var rec = store.getById(val);
                var name = "";
                if (rec) {
                    name = rec.get("fullName");
                } else {
                    name = "system";
                }
                return name;
            }
        });



        if (this.enableActionColumn) {
            columns.push({
                xtype: 'taco.menucolumn',
                text: 'Actions',
                onMenuShow: function(menu, eventData) {
                    var customerMenu = menu.items.get('customerMenu');
                    customerMenu.setVisible(eventData.record.get('customer'));
                },
                menuItems: [
                    {
                        text: 'Edit',
                        menuColumnHandler: 'editMenuColumnHandler'
                    }, {
                        text: 'Delete',
                        menuColumnHandler: 'destroyMenuColumnHandler'
                    }, {
                        text: 'Go To Customer Account',
                        itemId: 'customerMenu',

                        menuColumnHandler: function(event, item) {
                            Taco.core.StateManager.attemptNavigate('customer/edit/' + item.record.get('customerId'));
                        }
                    }
                ]
            });
        }
        return columns;
    },

    // template method that allows the grid instance to adjust the columns before instantiation;
    adaptColumns : Ext.emptyFn,

    onItemClick: function (view, record, elm, index, e) {
        // console.log(e.target);
        if (e.target.className === 'taco-launch-editor') {
            e.preventDefault();
            this.launchEditor(record);
            Taco.app.StateManager.addState('StoreCredits/edit/' + record.getId(), { id: record.getId() });
        }
    },

    doCreate : function (){
        var controller = "storeCredits"
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },


    launchEditor: function (record) {
        Ext.defer(function () {
            Taco.core.StateManager.attemptNavigate('StoreCredits/edit/' + record.getId(), { complexMetaData: { record: record } });
        }, 1, this);
        return;
    }

});