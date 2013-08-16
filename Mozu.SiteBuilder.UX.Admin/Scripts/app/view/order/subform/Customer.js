
/**
 * @class Taco.view.order.subform.Customer
 */

Ext.define('Taco.view.order.subform.Customer', {
    extend: 'Taco.view.order.subform.Subform',
    alias: 'widget.taco-ordercustomer',

    requires: [
        'Taco.shared.view.field.Customer'
    ],

    title: 'Customer',

    config: {
        record: null
    },

    initComponent: function () {

        this.customer = {};

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
                name: 'createAccount'
            }],
            listeners: {
                change: function (field, value) {
                    if (!field || !field.name) return;

                    console.log('CHANGE', field.name, value);
                    this.customer[field.name] = value;

                    console.log('CUSTOMER', this.customer);
                },
                scope: this
            }
        });

        this.customerField = Ext.widget({
            xtype: 'taco-customerfield',
            width: 500,
            listeners: {
                change: function (field, value) {
                    this.customer.customerAccountId = field.getValue();
                    console.log('customer', this.customer);
                },
                scope: this
            }
        });

        this.setCustomer = Ext.widget({
            xtype: 'dirtybutton',
            text: 'Assign Customer',
            click: this.assignCustomer,
            scope: this
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
        }, this.newCustomer,
            this.setCustomer
        ];

        this.callParent(arguments);

        this.selectExisting();
    },

    selectExisting: function () {
        this.customer = {};
        this.customerField.reset();
        this.customerField.show();
        this.newCustomer.hide();
    },

    createNew: function () {
        this.customer = {};
        this.newCustomer.getForm().reset();

        this.customerField.hide();
        this.newCustomer.show();
    },

    isValid: function () {
        var valid = this.customer.customerAccountId
            || (this.customer.firstName && this.customer.lastName && this.customer.email);

        this.setCustomer.setDirty(valid);

        return valid;
    },

    assignCustomer: function () {
        this.customer.orderId = this.record.getId();

        Ext.Ajax.request({
            url: '/admin/app/order/setcustomer',
            method: 'POST',
            jsonData: this.customer,
            success: function (record) {
                this.setCustomer.setDirty(false);
                console.log('setcustomer - success', record);
            },
            failure: function () {
                alert('ooops - setCustomer');
            },
            scope: this
        });
    }
});