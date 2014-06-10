/**
 * @class Taco.view.order.Form
 */
Ext.define('Taco.view.order.Form', {
    extend: 'Taco.core.ux.form.NavForm2',    
    alias: 'widget.taco-orderform',
    requires: [
        'Taco.model.Order',
        'Taco.model.OrderPayment',
        'Taco.view.order.Header',
        'Taco.view.order.subform.Customer',
        'Taco.view.order.subform.Detail',
        'Taco.view.order.subform.Payment',
        'Taco.view.order.subform.Shipping',
        'Taco.view.order.subform.InstorePickup',
        'Taco.view.order.subform.Return',
        'Taco.shared.view.form.ExtensibleAttribute'
    ],

    model: 'Taco.model.Order',

    config: {
        customer: null
    },

    editTitle: [
        'Order No. {number}',
        '<span class="taco-order-status {status}">',
            //'{status}',
            'Site: {siteName}',
        '</span>'
    ],

    createTitle: [
        'Create Order No. {number}',
        '<span class="taco-order-status">',
            //'{status}',
            'Site: {siteName}',
        '</span>'
    ],

    initComponent: function () {
        var me = this;

        // after the record is reloaded we will need to refresh the ui
        me.mon(me.record, 'aftercommit', function () {
            me.onRecordChange();
        }, me);
        

        /* 
           !!!this is redundant commit fires during reload!!!
        
         after the record is reloaded we will need to refresh the ui
        me.record.on("reload", function () {            
            me.onBeforeReload();
        }, this);

        */

        
        this.customer = {};
        // todo: get the customer record right away if an id exists;


        this.updateTitleData();

        this.buildForm();

        this.callParent(arguments);
        
        this.shippingForm = this.down('taco-ordershippingsimple');
        this.customerForm = this.down('taco-ordercustomer');
        this.paymentForm = this.down('taco-orderpayment');

        if (this.customerForm) {
            this.mon(this.customerForm, "customerChange", this.onCustomerChange, this);
        }


        this.orderDetail = this.down('taco-orderdetail');

        this.loadNavItems();

        
    },
    
    onCustomerChange : function (view, customerRecord){        
        this.customerRecord = customerRecord;
        //this.record.set("customerId", customerRecord.get("id"));        
        //this.shippingForm.onCustomerChange();
        this.shippingForm.onCustomerChange(this.customerRecord);
    },

    onBeforeReload : function() {
        //save the scrollTop position so that the main form container will be able to restore the scroll position
        var scrollPanel = this.el.up(".taco-content-body").el.dom;
        this.record.scrollTopTarget = scrollPanel.scrollTop;
        
    },
    
    updateTitleData: function () {
        this.titleData = {
            number: this.record.get('orderNumber'),
            status: this.record.get('orderStatus'),
            siteName: this.record.get('siteName')
        };
    },

    onRecordChange: function () {
        var me = this;
        // try and re-establish the scrollTop position after the record reloads;
        if (this.record.scrollTopTarget) {
            Ext.Function.defer(function () {
                me.el.up('.taco-content-body').dom.scrollTop = me.record.scrollTopTarget;
            }, 1000, me);
        }
        
        // update the title data with the latest version of the record
        this.updateTitleData();
        // update the superclasses title logic.
        this.initTitle();
    },

    buildForm: function () {
        var subformCfg = {
            record: this.record,
            orderForm: this                
        },
            items = [];

        if (this.isEdit()) {
            items.push(Ext.create('Taco.view.order.Header', subformCfg));
        }

        if (!this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.Customer', subformCfg));
        }

        items.push(Ext.create('Taco.view.order.subform.Detail', Ext.apply({
            listeners: {
                orderchange: function () {
                    if (this.shippingForm) {
                        // when the order editor closes we need to notify the shipping subform to update since the record may have changed;                                                
                        this.shippingForm.loadShippingMethods();
                    }
                },
                scope: this
            }
        },subformCfg)));

        if (!this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.ShippingSimple', subformCfg));
        }

        this.orderAttr = Ext.create('Taco.shared.view.form.ExtensibleAttribute', {
            title: 'Attributes',
            record: this.record,
            attributeDefinitionStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderAttributes')
        });
        
        this.orderAttr.tools = [{
            type: 'gear',
            menu: {
                plain: true,
                shadow: false,
                items: [{
                    text: 'Save Attributes',
                    handler: function () {
                        var me = this;
                        me.setLoading(true, this.body);

                        // rely on the subform's "beforeSave" method to save attributes to the model correctly.
                        me.orderAttr.beforeSave();

                        me.record.saveAttributes({
                            success: function () {
                                me.setLoading(false, this.body);
                            },
                            failure: function (msg) {
                                me.setLoading(false, this.body);
                                
                                var res = Ext.JSON.decode(msg.responseText);
                               
                                Taco.app.fireEvent('setmessage', res.items[0].message, 'error', me);
                            }
                        });
                    },
                    scope: this
                }]
            }
        }];
        items.push(this.orderAttr);
      
        if (this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.Payment', subformCfg));
            items.push(Ext.create('Taco.view.order.subform.Shipping', subformCfg));
            items.push(Ext.create('Taco.view.order.subform.InstorePickup', subformCfg));
            items.push(Ext.create('Taco.view.order.subform.Return', subformCfg)); 
        }

        this.items = items;
    },

    isEdit: function () {
        if (this._isEdit === undefined) {
            this._isEdit = this.record.get('orderStatus') !== 'Pending';
        }
        return this._isEdit;
    },

    isValid: function () {        
        var me = this,
            isValid = true,
            errors= [];

        // Only validate when in create mode
        if (this.isEdit()) isValid = false;        

        if (!this.customerRecord) {
            isValid = false;
            errors.push("A customer must be created or selected before saving this order");
        } else if (!this.record.itemsStore.count()) {
            isValid = false;
            errors.push("Products must be added before saving this order. Click the gear icon and select \"Edit Details\" to add products.");
        } else if (!this.record.data.fulfillmentContact || !this.record.data.fulfillmentContact.email) {
            isValid = false;
            errors.push("A shipping address must be created or selected before saving this order");
        } else if (!this.record.get("shippingMethodCode")) {
            isValid = false;
            errors.push("A shipping method must be selected before saving this order");
        }
        
        if (errors.length) {
            Taco.app.fireEvent('setmessage', errors.join("<br/>"), 'error', me);
        }

        // fire an event so that the editor wrapper can reenable the save button;
        this.fireEvent('beforesavefailure', me, errors);


        // Check basic form fields
        //if (!this.callParent(arguments)) return false;

        // Is customer valid?
        //if (!this.customerForm.isValid()) return false;

        // Is Shipping Valid?
        //if (!this.shippingForm.isValid()) return false;

        // Is Payment valid?
        // if (!this.paymentForm.isValid()) return false;

        // Is Order Item valid?
        // if (!this.orderDetail.isValid()) return false;

        return isValid;
    },

    beforeSave: function () {        
        var retVal = this.isValid();        
        return retVal
    },

    addSaveTasks: function(tasks) {
        var me = this;

        tasks.add({ 
            key: 'submitorder',
            fn: function(task) {
                Ext.Ajax.request({
                    url: '/admin/app/order/submit',
                    method: 'POST',
                    jsonData: { orderId: me.record.getId() },
                    success: function () {                        
                        //alert("Your order was created! Yay! You should probably close this window now.");
                        task.callback();                        
                    },
                    failure: function() {
                        task.callback(true);
                    }
                });
            }
        });
        return tasks;
    }
})
