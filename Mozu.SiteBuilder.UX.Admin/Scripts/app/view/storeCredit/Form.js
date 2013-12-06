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

        //selects the user that is passed in. This allows the renderer to do its thing and auto poplate
        // the email field if the user has one.
        /*me.customersStore.on('load', function (it) {
            
            if (this.isEdit() && me.customerName.getValue() == this.record.get('customerId')) {
                debugger
                var customerRec = '';
                customerRec = this.customersStore.findRecord('id', this.record.get('customerId'));
                this.customerName.select(customerRec);
            }

        }, this);*/
        me.customersStore.load();
        
        me.codeField = Ext.widget({
            xtype: 'textfield',
            name: 'code',
            fieldLabel: 'Code',
            readonly: me.isEdit()
        });

        me.dateIssued = Ext.widget({
            xtype: 'datefield',
            name: 'activationDate',
            fieldLabel: 'Date Issued',
            readOnly: me.isEdit()
        });
        
        me.expirationDate = Ext.widget({
            xtype: 'datefield',
            name: 'expirationDate',
            fieldLabel: 'Expiration Date'
        });

        me.orginalAmount = Ext.widget({
            xtype: 'textfield',
            name: 'initialBalance',
            fieldLabel: 'Original Amount',
           // allowBlank: false,
            readOnly: me.isEdit(),
            hidden: !me.isEdit()
        });
        
        me.amount = Ext.widget({
            xtype: 'textfield',
            name: 'currentBalance',
            fieldLabel: 'Amount',
            allowBlank: false
        });

        var pushData = {};
        var push2 = {};
        pushData['firstName'] = this.record.get('customer').firstName;
        push2['contacts'] = pushData;
        var renderData = [];
        renderData.push(push2);
        console.log(renderData);
        me.customerName = Ext.widget({
            xtype: 'taco-customerfield',
            fieldLabel: 'Customer Name',
            allowBlank: false,
            name: 'customerId',
            //data: this.record.get('customerId'),
            data: renderData,
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
                },
                scope: this
            }
        });
        
        me.emailCustomer = Ext.widget({
            xtype: 'checkboxfield',
            name: 'email',
            value: this.record.get('customer').primaryEmail,
            fieldLabel: 'Email store credit information to customer'
        });
        
        me.customerEmail = Ext.widget({
            xtype: 'textfield',
            name: 'customeremail',
            fieldLabel: 'Customer Email',
            value: this.record.get('customer').email,
            readOnly: true
        });

        me.transHistory = Ext.widget({
            xtype: 'textarea',
            name: 'transactionHistory',
            fieldLabel: 'Transaction History',
            readOnly: true
        });


        me.items = [
            me.codeField,
            me.dateIssued,
            me.expirationDate,
            me.orginalAmount,
            me.amount,
            me.customerName,
            me.customerEmail,
            me.emailCustomer,
            me.transHistory
        ];
    },
    beforeSave: function() {
        console.log(this.record);
    }
});
