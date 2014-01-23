/**
 * @class Taco.view.customers.modal.CreateCustomer
 */

Ext.define('Taco.view.customers.modal.CreateCustomer', {
    extend: 'Taco.core.ux.window.Modal',
    requires: [

    ],
    
    autoShow: true,
    scale: 'large',
    title: 'Create Customer',

    // this should really be the default;
    closeAction: 'destroy',

    initComponent: function () {
        var me = this;

        var data = {};

        this.record = Ext.create('Taco.model.CustomerAccount');

        me.taxExemptIdField = Ext.create('Ext.form.field.Text', {
            name: 'taxId',
            hidden: !data.taxExempt,
            labelClsExtra : "x-form-item-required-hidden",
            allowBlank: !data.taxExempt,
            width: 300,
            fieldLabel: 'Tax Exempt Code'
        });

        me.taxExamptField = Ext.create('Ext.form.FieldContainer', {
            items: [
                {
                    xtype: 'checkboxfield',
                    name: 'taxExempt',
                    style:"padding-top:24px;",
                    boxLabel: 'Tax Exempt',
                    listeners: {
                        'change': {
                            fn: function (field, newValue, oldValue, eOpts) {
                                me.taxExemptIdField.allowBlank = !newValue;
                                // force the hidden field to revalidate;                                
                                me.taxExemptIdField.validate();
                                me.taxExemptIdField.setVisible(newValue);                                
                            },
                            scope: me
                        }
                    }
                },
                me.taxExemptIdField
            ]
        });


        this.form = Ext.create('Ext.form.Panel', {            
            items: [
                {
                    xtype: 'textfield',
                    name: 'firstName',
                    allowBlank:false,
                    width:300,
                    fieldLabel: 'First Name'
                }, {
                    xtype: 'textfield',
                    allowBlank: false,
                    name: 'lastName',
                    width: 300,
                    fieldLabel: 'Last Name'
                }, {
                    xtype: 'textfield',
                    allowBlank: false,
                    name: 'emailAddress',
                    width: 300,
                    fieldLabel: 'Email Address'                
                },
                me.taxExamptField,
                {
                    xtype: 'checkbox',                    
                    boxLabel: 'Create an Account',
                    checked:true,
                    name: 'isAnonymous'
                }
            ]
        });

        this.items = [this.form];

        this.callParent(arguments);

        this.on({
            save: {
                scope: this,
                fn: 'save'
            }
        });
    },


    primaryHandler: function () {
        var me = this,
        data = this.form.getValues();
            
        // udpate the record with the form data;

        this.record.setRawData(data);
        if (this.fireEvent('beforesave', this) !== false) {
            this.record.save({
                success: function (record, operation) {                    
                    me.record.commit();
                    me.fireEvent('savesuccess', me, this.record);
                    me.close();
                },
                failure: function (record, operation) {
                    //handle failure(s) here                
                    Taco.app.fireEvent('setmessage', 'Error saving customer', 'error');
                }
            });


        }
    },

    save: function () {        
        
    },
    
    onDestroy: function (destroy) {
        this.callParent(arguments);
    }
});
