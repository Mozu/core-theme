/**
 * The discount editor view
 */
Ext.define('Taco.view.storeCredit.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.store.Customers',
        'Taco.shared.view.field.Customer'
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

        me.codeField = Ext.widget({
            xtype: 'textfield',
            name: 'code',
            fieldLabel: 'Code',
            allowBlank: false
        });

        me.dateIssued = Ext.widget({
            xtype: 'datefield',
            name: 'activationDate',
            fieldLabel: 'Date Issued',
            readOnly: me.isEdit()
        });
        
        me.orginalAmount = Ext.widget({
            xtype: 'textfield',
            name: 'initialBalance',
            fieldLabel: 'Original Amount',
            allowBlank: false,
            readOnly: me.isEdit(),
            hidden: !me.isEdit()
        });
        
        me.amount = Ext.widget({
            xtype: 'textfield',
            name: 'currentBalance',
            fieldLabel: 'Amount',
            allowBlank: false
        });

        me.customerName = Ext.widget({
            xtype: 'taco-customerfield',
            fieldLabel: 'Customer Name',
            allowBlank: false,
            name: 'customerId',
            displayTpl: Ext.create('Ext.XTemplate',
                '<tpl for=".">',
                '<tpl for="contacts">',
                '{firstName} {middleName} {lastName}',
                '</tpl>',
                '</tpl>'
            ),
            listConfig: {
                getInnerTpl: function () {
                    return '{primaryFirstName} {primaryMiddleName} {primaryLastName}  - {primaryEmail}';
                }
            },
            listeners: {
                change: function (field, value) {
                    if (field.valueModels) {
                        this.customerEmail.setValue(field.valueModels[0].get('primaryEmail'));
                    }
                        
                    console.log('customer', field.getValue());
                    
                },
                scope: this
            }
        });
        /*
        Why do we need to display the customer Id
        This isn't even displayed on the customer page

        me.customerNumber = {
            xtype: 'textfield',
            name: 'customerNumber',
            fieldLabel: 'Customer Number'
        };
        */
       

        me.emailCustomer = Ext.widget({
            xtype: 'checkboxfield',
            name: 'email',
            fieldLabel: 'Email store credit information to customer'
        });
        
        me.customerEmail = Ext.widget({
            xtype: 'textfield',
            name: 'customeremail',
            fieldLabel: 'Customer Email',
            readOnly: true
        });

        me.transHistory = Ext.widget({
            xtype: 'textarea',
            name: 'transactionHistory',
            fieldLabel: 'Transaction History'
        });


        me.items = [
            me.codeField,
            me.dateIssued,
            me.orginalAmount,
            me.amount,
            me.customerName,
            //me.customerNumber,
            me.customerEmail,
            me.emailCustomer,
            me.transHistory
        ];
    }
});
