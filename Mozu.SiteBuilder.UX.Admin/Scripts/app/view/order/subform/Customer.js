
/**
 * @class Taco.view.order.subform.Customer
 */

Ext.define('Taco.view.order.subform.Customer', {
    extend: 'Taco.view.order.subform.Subform',

    requires: [
        'Taco.shared.view.field.Customer'
    ],

    title: 'Customer',

    config: {
        record: null
    },

    initComponent: function () {

        this.newCustomer = Ext.widget({
            xtype: 'formform',
            hidden: true,
            items: [{
                xytpe: 'fieldcontainer',
                defaultType: 'textfield',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [{
                    emptyText: 'First Name',
                    name: 'firstName'
                }, {
                    emptyText: 'Last Name',
                    name: 'lastName'
                }, {
                    emptyText: 'Email Address',
                    name: 'email',
                    flex: 1
                }]
            }, {
                xtype: 'checkbox',
                boxLabel: 'Create an Account',
                name: 'customerCreateAccount'
            }]
        });

        this.customerField = Ext.widget({
            xtype: 'taco-customerfield',
            width: 500
        });

        this.items = [{
            xtype: 'radiofield',
            boxLabel: 'Select Existing',
            name: 'customer',
            inputValue: 'existing',
            checked: true,
            listeners: {
                change: function (field, value) {
                    if (value) this.selectExisting();
                    else this.createNew();
                },
                scope: this
            }
        }, this.customerField, {
            xtype: 'radiofield',
            boxLabel: 'Create New',
            name: 'customer',
            inputValue: 'new',
            checked: false
        }, this.newCustomer];

        this.callParent(arguments);

        this.selectExisting();
    },

    selectExisting: function () {
        var value = this.customerField.getValue();

        this.customerField.show();
        this.newCustomer.hide();

        if (value) {
            Taco.model.CustomerAccount.load({
                id: value
            }, {
                success: this.orderForm.overwriteCustomer,
                scope: this.orderForm
            })
        } else {
            this.orderForm.overwriteCustomer();
        }
    },

    createNew: function () {
        

        this.customerField.hide();
        this.newCustomer.show();
    }
});