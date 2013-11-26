/**
 * The discount editor view
 */
Ext.define('Taco.view.storeCredit.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        //'Taco.store.ConfiguredShippingRates'
    ],
    ui: 'subform',
    title: 'Store Credit',
    
    initComponent: function () {
        this.buildFormComponents();

        this.callParent(arguments);
    },

    buildFormComponents: function () {
        var me = this;

        me.codeField = {
            xtype: 'textfield',
            name: 'code',
            fieldLabel: 'Code',
            required: true,
            allowBlank: false
        };

        me.dateIssued = {
            xtype: 'datefield',
            name: 'dateIssued',
            fieldLabel: 'Date Issued'
        };

        me.amount = {
            xtype: 'textfield',
            name: 'amount',
            fieldLabel: 'Amount',
            required: true,
            allowBlank: false
        };

        me.customerName = {
            xtype: 'textfield',
            name: 'customerName',
            fieldLabel: 'Customer Name',
            required: true,
            allowBlank: false
        };

        me.customerNumber = {
            xtype: 'textfield',
            name: 'customerNumber',
            fieldLabel: 'Customer Number'
        };
        
        me.emailCustomer = {
            xtype: 'checkboxfield',
            name: 'email',
            fieldLabel: 'Email store credit information to customer'
        };
        
        me.customerEmail = {
            xtype: 'textfield',
            name: 'customeremail',
            fieldLabel: 'Customer Email'
        };

        me.transHistory = {
            xtype: 'textfield',
            name: 'transactionHistory',
            fieldLabel: 'Transaction History'
        };


        me.items = [
            me.codeField,
            me.dateIssued,
            me.amount,
            me.customerName,
            me.customerNumber,
            me.emailCustomer, 
            me.customerEmail,
            me.transHistory
        ];
    }
});
