/**
 * @class Taco.view.customers.Index
 */

Ext.define('Taco.view.customers.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',
    alias: 'widget.taco.index.customer',
    requires: [
        'Taco.model.CustomerAccount',
        'Taco.store.CustomerGrid',
        'Taco.view.customers.AdvancedSearchForm',
        'Taco.store.CustomerSegments'
    ],
    reFetchRecordOnEdit: true,
    typeName: 'Customer',
    modelName: 'Taco.model.CustomerAccount',
    store: { type: 'Taco.store.CustomerGrid' },
    editorName: 'Taco.view.customer.Edit',
    useTilePanel: false,
    
  
    initComponent: function () {
       
        this.header = {
            title: 'Customers'
        };

       

        this.gridPanelConf = {
            stateful: true,
            stateId: 'statefulCustomerGrid',
            columns: {
                defaults: {
                    sortable: false
                },
                items: [
                {
                    dataIndex: 'id',
                    stateId:"id",
                    sortable: true,
                    text: 'Customer Number',
                    width: 130
                }, {
                    dataIndex: 'firstNameSafe',
                    stateId: "firstNameSafe",
                    text: 'First Name',
                    width: 130,
                    renderer: function (value, metaData, record) {
                        if (value)
                            return value;
                        if (!Ext.isEmpty(record.data.contacts)) {
                            return Ext.util.Format.htmlEncode(record.data.contacts[0].firstName);
                        }
                        return null;
                    }

                }, {
                    dataIndex: 'lastNameSafe',
                    stateId: "lastNameSafe",
                    text: 'Last Name',
                    width: 130,
                    renderer: function (value, metaData, record) {
                        if (value)
                            return value;
                        if (!Ext.isEmpty(record.data.contacts)) {
                            return Ext.util.Format.htmlEncode(record.data.contacts[0].lastName);
                        }
                        return null;
                    }
                }, {
                    dataIndex: 'emailAddressSafe',
                    stateId: "emailAddressSafe",
                    text: 'Email',
                    width: 200,
                    renderer: function (value, metaData, record) {
                        if (value)
                            return value;
                        if (!Ext.isEmpty(record.data.contacts)) {
                            return Ext.util.Format.htmlEncode(record.data.contacts[0].emailAddress);
                        }
                        return null;
                    }
                }, {
                    dataIndex: 'isAnonymous',
                    stateId: 'isAnonymous',
                    text: 'Shopper Acct',
                    width: 100,
                    renderer: function (value, metaData, record) {
                        if (!value) {
                            return 'Y';
                        } else {
                            return 'N';
                        }
                    }
                }, {
                    dataInex: 'accountStatus',
                    stateId: 'accountStatus',
                    text: 'Status',
                    width: 100,
                    renderer: function (value, metaData, record) {
                        return record.get('accountStatus');
                    }
                }, {
                    dataIndex: 'orderCount',
                    stateId: "orderCount",
                    sortable: true,
                    text: 'Fulfilled Orders',
                    width: 100
                }, {
                    dataIndex: 'totalSpent',
                    stateId: "totalSpent",
                    sortable: true,
                    text: 'Lifetime Value',
                    width: 100,
                    renderer: function (value) {
                        return Ext.util.Format.currency(value, '$', 2);

                        //todo localization
                    }
                }, {
                    dataIndex: 'visitCount',
                    stateId: "visitCount",
                    text: 'Total Visits',
                    width: 100
                }, {
                    dataIndex: 'segments',
                    stateId: "segments",
                    text: 'Segments',
                    width: 300,
                    renderer: function (value) {
                        var codes = [];
                        if (value && value.length) {
                            codes = Ext.Array.pluck(value, 'code');
                            return codes.join(', ');
                        }
                        return '';

                    },
                    minWidth: 100,
                    flex: 1
                }, {
                    xtype: 'taco.menucolumn',
                    text: 'Actions',
                    flex: 1,
                    menuItems: [{
                        text: 'Edit',
                        requiredBehaviors: {
                            model: 'Taco.model.CustomerAccount',
                            behavior: 'update'
                        },
                        menuColumnHandler: function (item, eventData) {
                            var page = eventData.grid.getParentPage(),
                                record = eventData.record,
                                metaData = { id: record.getId() };

                            page.launchEditor(record, metaData);
                        }
                    }],
                    // do any processing needed to show menu
                    onMenuShow: function () { }
                }]
            } 
        };
        
        this.callParent(arguments);
    },
    
    advancedSearchConfig : {
        advancedFormCls: 'Taco.view.customers.AdvancedSearchForm'
    },
    
    allowCreate: function() {
        return false;
    }
});
