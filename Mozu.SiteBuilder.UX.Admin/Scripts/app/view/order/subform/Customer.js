
/**
 * @class Taco.view.order.subform.Customer
 */

Ext.define('Taco.view.order.subform.Customer', {
    extend: 'Taco.view.order.subform.Subform',
    alias: 'widget.taco-ordercustomer',

    requires: [
        'Taco.shared.view.field.Customer',
        'Taco.view.customers.modal.CreateCustomer'
    ],

    title: 'Customer',

    config: {
        record: null
    },

    initComponent: function () {

        

        this.customer = {};
        

        /*
        this.newCustomer = Ext.widget({
            xtype: 'formform',
            hidden: true,
            items: [{
                xytpe: 'fieldcontainer',
                defaultType: 'textfield',
                //layout: {
                //    type: 'hbox',
                //    align: 'stretch'
                //},
                items: [{
                    emptyText: 'First Name',
                    name: 'firstName',
                    fieldLabel:"First Name",
                    width: 300
                }, {
                    emptyText: 'Last Name',
                    name: 'lastName',
                    fieldLabel: "Last Name",
                    width: 300
                }, {
                    emptyText: 'Email Address',
                    fieldLabel: "Email Address",
                    name: 'email',                    
                    width: 300
                }]
            }, {
                xtype: 'checkbox',
                boxLabel: 'Create an Account',
                checked:true,
                name: 'createAccount'
            }],
            listeners: {
                change: function (field, value) {
                    if (!field || !field.name) return;                    

                    this.customer[field.name] = value;
                    
                    this.isValid();
                },
                scope: this
            }
        });
        */

        this.customerField = Ext.widget({
            xtype: 'taco-customerfield',            
            flex: 1,
            emptyText: 'Customer Search',
            listeners: {
                select : function (combo,records, eOpts){                    
                    var selectedRecord = records[0];
                    if (selectedRecord) {
                        // update this json. its used to persist the assignement;
                        this.customer.customerAccountId = selectedRecord.get("id");

                        // cache the customer record;
                        this.customerRecord = selectedRecord;

                        // perisist the assignment of this customer to this order;
                        this.assignCustomer;

                        // notifiy the other subforms of the change;
                        this.updateCustomerInformation()
                    }
                },
                scope:this                
            }
        });


        /*
        this.setCustomer = Ext.widget({
            //xtype: 'dirtybutton',
            xtype: "button",
            ui: "action-primary",
            scale:"medium",
            text: 'Assign Customer',
            handler: this.assignCustomer,
            scope: this
        });
        */

        /*

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

        */

        this.items = [
            {
                xtype:"container",
                layout:"hbox",
                items:[
                    this.customerField,
                    {
                        xtype:"button",
                        ui:"action-primary",
                        scale: "medium",
                        margin: "0px 0px 0px 19px ",
                        text:"Create New Customer",
                        handler: this.createCustomer,
                        scope:this
                    }
                ]
            }

            //,this.setCustomer
        ]

        this.callParent(arguments);

        this.selectExisting();
    },

    createCustomer: function () {
        var win = Ext.create('Taco.view.customers.modal.CreateCustomer',{
            listeners:{
                scope:this,
                save: function (view){
                    
                },
                savesuccess: function (view, data) {
                    
                }
            }        
        });
    },

    updateCustomerInformation: function () {
        // fire event for the other sub panels to react to.
        this.fireEvent('customerChange', this, this.customerRecord);

        /*
        acceptsMarketing: false
        attributes: Array[0]
        companyOrOrganization: ""
        contacts: Array[
            {
                address1: "2301 S 5TH ST APT 27"
                address2: ""
                addressIsValidated: true
                cityOrTown: "AUSTIN"
                countryCode: "US"
                email: "ojas_patel@volusion.com"
                firstName: "ojas"
                homePhone: "1231231231"
                id: 1000
                lastName: "patel"
                postalOrZipCode: "78704-5188"
                stateOrProvince: "TX"
            }        
        ]
        createDate: Wed Jan 15 2014 11:27:01 GMT-0600 (CST)
        emailAddress: "ojas_patel@volusion.com"
        firstName: "ojas"
        groups: Array[0]
        id: 1000
        lastName: "patel"
        lastOrderDate: null
        orderCount: 0
        totalSpent: 0
        userId: ""
        userName: ""
        visitCount: 0
        */


    },

    selectExisting: function () {
        //this.customer = {};
        //this.customerField.reset();
        //this.customerField.show();
        //this.newCustomer.hide();


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

        //this.setCustomer.setDirty(valid);

        return valid;
    },

    assignCustomer: function () {
        this.customer.orderId = this.record.getId();
        

        //this.newCustomer.getForm().reset();

        Ext.Ajax.request({
            url: '/admin/app/order/setcustomer',
            method: 'POST',
            jsonData: this.customer,
            success: function (record) {
                //this.setCustomer.setDirty(false);
                console.log('setcustomer - success', record);
            },
            failure: function () {
                alert('ooops - setCustomer');
            },
            scope: this
        });
    }
});