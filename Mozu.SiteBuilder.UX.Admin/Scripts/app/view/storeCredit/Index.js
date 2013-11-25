/**
 * @class Taco.view.storeCredit.Index
 */

Ext.define('Taco.view.storeCredit.Index', {
    extend: 'Taco.core.ux.browser.BrowserPage',

    requires: ['Taco.model.StoreCredit', 'Taco.store.StoreCredits'/*, 'Taco.view.storeCredit.Edit'*/],

    requiresContextOfType: [],

    modelName: 'Taco.model.StoreCredit',
    store: {
        type: 'Taco.store.StoreCredits'
    },
    //editorName: 'Taco.view.storeCredit.Edit',
    //filterProperty: 'name',
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
            dataIndex: 'issuedAmount',
            text: 'Issued Amount',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'customerName',
            text: 'Customer Name',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'dateIssued',
            text: 'Date Issued',
            flex: 1,
            minWidth: 120
        }, {
            dataIndex: 'balance',
            text: 'balance',
            flex: 1,
            minWidth: 120
        }, {
            xtype: 'taco.menucolumn',
            text: 'Actions',
            menuItems: [{
                text: 'Edit',
                menuColumnHandler: 'editMenuColumnHandler'
            }, {
                text: 'Delete',
                menuColumnHandler: 'destroyMenuColumnHandler'
            }, {
                text: 'Go To Customer Account',
                menuColumnHandler: 'destroyMenuColumnHandler'
            }]
        }]
    }
    
   
})