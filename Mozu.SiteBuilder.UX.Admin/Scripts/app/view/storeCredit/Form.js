/**
 * The discount editor view
 */
Ext.define('Taco.view.storeCredit.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.Customers'
    ],
    ui: 'subform',
    title: 'Store Credit',
    layout: 'fit',
    initComponent: function () {
        this.buildFormComponents();

        this.callParent(arguments);
    },

    buildFormComponents: function() {
        var me = this;
        me.customersStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Customers');

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
            xtype: 'combobox',
            name: 'customerName',
            fieldLabel: 'Customer Name',
            store: me.customersStore,
            displayField: 'firstName',
            valueField: 'id',
            queryMode: 'local',
            required: true,
            allowBlank: false,
            // Template for the dropdown menu.
            // Note the use of "x-boundlist-item" class,
            // this is required to make the items selectable.
            tpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                '<tpl for="contacts">',
                '<div class="x-boundlist-item">{firstName} {middleName} {lastName}</div>',
                '</tpl>',
                '</tpl>'
            ),
            // template for the content inside text field
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                '<tpl for="contacts">',
                '{firstName} {middleName} {lastName}',
                '</tpl>',
                '</tpl>'
            )
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
            xtype: 'textarea',
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
