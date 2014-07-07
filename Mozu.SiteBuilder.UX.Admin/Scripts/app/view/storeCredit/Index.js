/**
 * @class Taco.view.storeCredit.Index
 */

Ext.define('Taco.view.storeCredit.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',

    requires: ['Taco.model.StoreCredit', 'Taco.store.StoreCredits', 'Taco.view.storeCredit.Edit'],

    

    modelName: 'Taco.model.StoreCredit',
    store: {
        type: 'Taco.store.StoreCredits'
    },
    editorName: 'Taco.view.storeCredit.Edit',
    filterProperty: 'name',
    typeName: 'Store Credit',

    initComponent: function () {
        
        this.callParent(arguments);
    },

    gridPanelConf: {
        columns: [ {
            dataIndex: 'code',
            text: 'Code',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'creditType',
            text: 'Type',
            minWidth: 120
        } ,{
            dataIndex: 'initialBalance',
            text: 'Issued Amount',
            flex: 1,
            renderer: function (value, metaData, record) {
                return Taco.app.context.formatCurrencyFromCode(record.get('currencyCode'), value);
            },
            minWidth: 120
        }, {
            dataIndex: 'customer',
            text: 'Customer',
            flex: 1,
            minWidth: 120,
            renderer: function (customer) {
                if (customer) {
                    return customer.firstName + ' ' + customer.lastName + '(' + customer.id + ')';
                }
            }
        }, {
            dataIndex: 'activationDate',
            text: 'Date Issued',
            flex: 1,
            minWidth: 120,
            xtype: 'datecolumn',
            format: 'M d g:ia'
        }, {
            dataIndex: 'currentBalance',
            text: 'Current Balance',
            flex: 1,
            renderer: function (value, metaData, record) {
                return Taco.app.context.formatCurrencyFromCode(record.get('currencyCode'), value);
                
            },
            minWidth: 120
        }, {
            dataIndex: 'customerId',
            text: 'Customer Id',
            flex: 1,
            minWidth: 120,
            hidden: true
        }, {
            dataIndex: 'customer',
            text: 'Customer Email',
            flex: 1,
            minWidth: 120,
            hidden: true,
            renderer: function (customer) { return customer.email; }
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            onMenuShow: function (menu, eventData) {
                var customerMenu = menu.items.get('customerMenu');
                customerMenu.setVisible(eventData.record.get('customer'));
            },
            menuItems: [{
                text: 'Edit',
                menuColumnHandler: 'editMenuColumnHandler'
            }, {
                text: 'Delete',
                menuColumnHandler: 'destroyMenuColumnHandler'
            }, {
                text: 'Go To Customer Account',
                itemId: 'customerMenu',
                
                menuColumnHandler: function (event, item) {
                    Taco.core.StateManager.attemptNavigate('customer/edit/' + item.record.get('customerId'));
                }
            }]
        }]
    }
    
   
})