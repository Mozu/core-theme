
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

        this.customerDetail = Ext.widget({
            xtype: "editabledisplayfield",
            margin: "10px 0px 0px 0px",
            border: false,
            tpl: [
                '<tpl if="firstName">',

                    '{firstNameSafe} {lastNameSafe} {emailAddressSafe}',

                '<tpl else>',
                    'Select or Create a Customer',
                '</tpl>'
            ]
        });

        this.customerField = Ext.widget({
            xtype: 'taco-customerfield',            
            flex: 1,
            emptyText: 'Customer Search',
            listeners: {
                select : function (combo,records, eOpts){                    
                    var selectedRecord = records[0];
                    if (selectedRecord) {
                        me.onCustomerChange(selectedRecord);
                    }
                },
                scope:this                
            }
        });

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

    onCustomerChange : function (customerRecord) {
        // update this json. its used to persist the assignement;
        this.customer.customerAccountId = customerRecord.get("id");

        // cache the customer record;
        this.customerRecord = customerRecord;

        this.customerDetail.update(this.customerRecord.data);

        // perisist the assignment of this customer to this order;
        this.assignCustomer();

        
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

                // need to make sure that any customer related members get reset when the customer changes



                // notifiy the other subforms of the change;
                this.updateCustomerInformation()
            },
            failure: function () {
                alert('ooops - setCustomer');
            },
            scope: this
        });
    }
});