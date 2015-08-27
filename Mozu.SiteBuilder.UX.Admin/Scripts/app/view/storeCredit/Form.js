/**
 * The discount editor view
 */
Ext.define('Taco.view.storeCredit.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.shared.view.field.Customer',
        'Taco.core.ux.form.CurrencyField'
    ],
    ui: 'subform',
    createTitle: 'Create New Store Credit',
    layout: 'fit',
    initComponent: function () {
        this.buildFormComponents();

        if (!this.isCreate) {
            this.title = 'Edit Store Credit: ' + this.record.data.code;
        }


        this.callParent(arguments);
    },

    buildFormComponents: function () {
        var me = this;


        me.codeField = Ext.widget({
            xtype: 'textfield',
            name: 'code',
            fieldLabel: 'Code',
            readonly: me.isEdit()
        });

        me.activationDate = Ext.widget({
            xtype: 'datefield',
            name: 'activationDate',
            fieldLabel: 'Activation Date',
            readOnly: me.isEdit()
        });

        me.expirationDate = Ext.widget({
            xtype: 'datefield',
            name: 'expirationDate',
            fieldLabel: 'Expiration Date'
        });

        me.orginalAmount = Ext.widget({
            xtype: 'currencyfield',
            name: 'initialBalance',
            fieldLabel: 'Original Amount',
            // allowBlank: false,
            readOnly: me.isEdit(),
            hidden: !me.isEdit()
        });

        me.amount = Ext.widget({
            xtype: 'currencyfield',

            name: 'currentBalance',
            fieldLabel: 'Amount',
            allowBlank: false
        });


        me.customerName = Ext.widget({
            xtype: 'taco-customerfield',
            fieldLabel: 'Customer',
            allowBlank: true,

            name: 'customerId',

            listeners: {
                change: function (field, value) {
                    var model = field.findRecordByValue(value || -1);
                    if (model) {
                        this.customerEmail.setValue(model.get('emailAddress'));
                    }


                },
                scope: this
            }
        });

        me.emailCustomer = Ext.widget({
            xtype: 'checkboxfield',
            name: 'email',
            //  value: this.record.get('customer').,
            fieldLabel: 'Email store credit information to customer'
        });

        me.creditType = Ext.widget({
            xtype: 'combo',
            readOnly: me.isEdit(),
            name: 'creditType',
            fieldLabel: 'Credit Type',
            store: ['StoreCredit', 'GiftCard'],
            queryMode: 'local',
            editable: false
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
            me.creditType,
            me.codeField,
            me.activationDate,
            me.expirationDate,
            me.orginalAmount,
            me.amount,
            me.customerName
        ];
    },
    beforeSave: function () {

    }
});