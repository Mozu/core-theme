
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
        var me = this;
        

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

        this.customerDetail = Ext.widget({
            xtype: "editabledisplayfield",
            margin: "10px 0px 0px 0px",
            border: false,
            tpl: [
                '<tpl if="firstName">',

                    '{firstName} {lastName} {emailAddress}',

                '<tpl else>',
                    'Select or Create a Customer',
                '</tpl>'
            ]
        })



        this.customerField = Ext.widget({
            xtype: 'taco-customerfield',            
            flex: 1,
            emptyText: 'Customer Search',
            listeners: {
                select : function (combo,records, eOpts){                    
                    var selectedRecord = records[0];
                    if (selectedRecord) {
                        me.onCustomerChange(selectedRecord);
                        /*
                        // update this json. its used to persist the assignement;
                        this.customer.customerAccountId = selectedRecord.get("id");

                        // cache the customer record;
                        this.customerRecord = selectedRecord;

                        // perisist the assignment of this customer to this order;
                        this.assignCustomer();

                        // notifiy the other subforms of the change;
                        this.updateCustomerInformation()
                        */
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
            },

            this.customerDetail

            //,this.setCustomer
        ]

        this.callParent(arguments);

        this.selectExisting();
    },

    createCustomer: function () {
        var me = this;

        var win = Ext.create('Taco.view.customers.modal.CreateCustomer',{
            listeners:{
                scope:me,                
                savesuccess: function (view, record) {                
                    me.onCustomerChange(record);
                }
            }        
        });
    },

    updateCustomerInformation: function () {

        this.customerField.clearValue();

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
        var customerId = this.record.get("customerId");
        if (customerId) {
            // update this json. its used to persist the assignement;
            this.customer.customerAccountId = customerId;

            Taco.model.CustomerAccount.load(customerId, {
                scope: this,
                failure: function (record, operation) {
                    
                },
                success: function (record, operation) {
                    // cache the customer record;
                    this.customerRecord = record;

                    this.customerDetail.update(this.customerRecord.data);


                    // notifiy the other subforms that the customer record has loaded;
                    // todo: look into preloading the customerRecord for this order;
                    this.updateCustomerInformation()
                }
            });            
        }
    },
    /*
    createNew: function () {
        this.customer = {};
        this.newCustomer.getForm().reset();

        this.customerField.hide();
        this.newCustomer.show();
    },
    
    */
    /*
    isValid: function () {
        var valid = this.customer.customerAccountId
            || (this.customer.firstName && this.customer.lastName && this.customer.email);

        //this.setCustomer.setDirty(valid);

        return valid;
    },

    */
    onCustomerChange : function (customerRecord) {
        // update this json. its used to persist the assignement;
        this.customer.customerAccountId = customerRecord.get("id");

        // cache the customer record;
        this.customerRecord = customerRecord;

        this.customerDetail.update(this.customerRecord.data);

        // perisist the assignment of this customer to this order;
        this.assignCustomer();

        // notifiy the other subforms of the change;
        this.updateCustomerInformation()
    },

    assignCustomer: function () {
        this.customer.orderId = this.record.getId();        

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