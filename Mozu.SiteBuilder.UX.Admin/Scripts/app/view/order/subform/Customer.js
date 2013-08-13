
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
        record: null,
    },

    initComponent: function () {

        this.newCustomer = Ext.widget({
            xtype: 'container',
            hidden: 'true',
            items: [{
                xytpe: 'fieldcontainer',
                defaultType: 'textfield',
                layout: {
                    type: 'hbox',
                    align: 'stretch'
                },
                items: [{
                    emptyText: 'First Name',
                    name: 'customerFirstName'
                }, {
                    emptyText: 'Last Name',
                    name: 'customerLastName'
                }, {
                    emptyText: 'Email Address',
                    name: 'customerEmail',
                    flex: 1
                }]
            }, {
                xtype: 'checkbox',
                boxLabel: 'Create an Account',
                name: 'customerCreateAccount'
            }]
        });

        this.customerField = Ext.widget({
            xtype: 'taco.customerfield',
            flex: 1,
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
                    console.log('change', value);
                    if (value) {
                        this.customerField.show();
                        this.newCustomer.hide();
                    } else {
                        this.customerField.hide();
                        this.newCustomer.show();
                    }
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
    }
});