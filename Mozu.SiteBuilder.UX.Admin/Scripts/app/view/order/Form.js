/**
 * @class Taco.view.order.Form
 */
Ext.define('Taco.view.order.Form', {
    extend: 'Taco.core.ux.form.NavForm2',
    extend: 'Taco.core.ux.form.TabForm',
    
    alias: 'widget.taco-orderform',
    requires: [
        'Taco.model.Order',
        'Taco.model.OrderPayment',
        'Taco.view.order.Header',
        'Taco.view.order.subform.Customer',
        'Taco.view.order.subform.Detail',
        'Taco.view.order.subform.Payment',        
        'Taco.view.order.subform.Return',        
        'Taco.view.order.subform.InternalNotes',
        'Taco.view.order.subform.Fulfillment'
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
        
        this.loadNavItems();
    },
    
    onCustomerChange: function (view, customerRecord) {        
        //this.customerRecord = customerRecord;
        //this.record.set("customerId", customerRecord.get("id"));        
        //this.shippingForm.onCustomerChange();
        //this.shippingForm.onCustomerChange(this.customerRecord);
    },

    onBeforeReload: function () {
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

    isHeaderDataComplete: function () {
        var me = this,
            fulfillmentContact = me.record.get("fulfillmentContact"),
            billingContact = me.record.get("billingContact"),
            isValid = true;
        
        // if we have a fulfillment contact and billing contact and its not an empty object
        if (!fulfillmentContact || Ext.Object.isEmpty(fulfillmentContact) || !billingContact || Ext.Object.isEmpty(billingContact)) {
            isValid = false;
        }
        return isValid 
    },


    updatePanelVisibility: function () {
        var me = this,
            orderItems = this.record.get("items"),
            navUpdateRequired = false;
        

        // need to cache what's selected 
        

        // begin if statement from hell...
        // if a admin entered order that has not been submitted we need to do some visibility magic;
        if (this.record.get("orderStatus") == "Pending") {
            // need to adjust the visibility of subforms based on the progression of data entry in phone orders
            if (me.isHeaderDataComplete()) {
                //this.formContainer.show()
                navUpdateRequired = true;
                if (!this.orderDetailPanel.rendered) {
                    this.formContainer.add(this.orderDetailPanel);
                }

                // if the order has some order items
                if (orderItems.length) {
                    if (!this.paymentPanel.rendered) {
                        this.formContainer.add(this.paymentPanel);
                        navUpdateRequired = true;
                    }
                }
            } else {
                
                //this.formContainer.hide()
                navUpdateRequired = true;


                // header isn't filled out we need to hide the sub panels if they are currently visible;
                if (!this.orderDetailPanel.isHidden() || !this.paymentPanel.isHidden()) {
                    // until the customer info is filled out we need to hide the details and payments panel

                    //this.orderDetailPanel.hide()
                    //this.paymentPanel.hide();
                    // update the left nav
                    //navUpdateRequired = true;
                }
            }

            if (navUpdateRequired) {
                this.loadNavItems();
            }
        }

    },

    onRecordChange: function () {
        var me = this,
            orderItems = this.record.get("items")
        
        this.updatePanelVisibility();

        //if (me.isHeaderDataComplete() && (this.orderDetailPanel.isHidden() || this.paymentPanel.isHidden())) {
        //    // need to show the hidden panels once the customer information is defined;
        //    navUpdateRequired = true;

        //    this.orderDetailPanel.show()

        //    // check if we have order items. Can't do payments until order has items. 
            
        //    this.paymentPanel.show();
        //    // update the left nav
        //    this.loadNavItems();
        //} else if (!this.orderDetailPanel.isHidden() || !this.paymentPanel.isHidden()) {
        //    // need to hide the subforms until the user has selected a customer, shipping and billing addresses.
        //    this.orderDetailPanel.hide()
        //    this.paymentPanel.hide();
        //    // update the left nav
        //    this.loadNavItems();
        //}


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
        var me = this;
        var items = [];
        
        var subformCfg = {
            record: this.record,
            orderForm: this                
        };

        this.headerCmp = Ext.create('Taco.view.order.Header', Ext.apply({
            excludeFromNavigation: true,
            listeners: {
                scope: this,
                afterlayout: function (view, width, height, oldWidth, oldHeight) {
                    this.alignLeftNav();
                    // this one only exists if this is in navForm2 instead of tabForm; TODO: refactor navForm2 to not cache the panel heights in the store; ie get rid of the mapping.
                    if (this.rebuildMap) {
                        this.rebuildMap();
                    }
                }
            }
        }, subformCfg));

        this.mon(this.headerCmp, 'customerchanged', this.onCustomerChange, me);
            
        items.push(this.headerCmp);
                
        this.orderDetailPanel = Ext.create('Taco.view.order.subform.Detail', Ext.apply({
            //hidden: !this.isHeaderDataComplete(),
            //disabled: !this.isHeaderDataComplete(),
            listeners: {
                orderchange: function () {
                    if (this.shippingForm) {
                        // when the order editor closes we need to notify the shipping subform to update since the record may have changed;                                                
                        //this.shippingForm.loadShippingMethods();

                        // enable the shipping methods button;
                        // enable the payments method;
                    }
                },
                scope: this
            }

        }, subformCfg))
        

        // we always show for online orders. for offline orders we need hide the detail panel until the header is filled out.
        if ((me.record.get("orderType")=="Online") || me.isHeaderDataComplete()) {
            items.push(this.orderDetailPanel);
        }


        this.paymentPanel = Ext.create('Taco.view.order.subform.Payment', Ext.apply({
            //hidden: !this.isHeaderDataComplete()
        }, subformCfg));

        if (this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.Fulfillment', subformCfg));
        }


        // we always show for online orders and conditionaly show for offline orders
        if ((me.record.get("orderType")=="Online")  || (me.isHeaderDataComplete() && this.record.get("items").length)) {
            items.push(this.paymentPanel);
        }
      

        // adding the header data check here because there are instances of old data that lack shipping and billing contact.
        if ((me.record.get("orderType") == "Online") || (this.isEdit() && me.isHeaderDataComplete())) {
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
           errors = [];

        
        var isShippable = this.record.isShippable();
        // Only validate when in create mode
        if (this.isEdit()) isValid = false;

        if (!this.record.get("customerId")) {
            isValid = false;
            errors.push("A customer must be created or selected before submitting this order");
        } else if (Ext.Object.isEmpty(this.record.get("fulfillmentContact"))) {
            isValid = false;
            errors.push("Shipping Address must be added before submitting this order.");
        } else if (Ext.Object.isEmpty(this.record.get("billingContact"))) {
            isValid = false;
            errors.push("Billing Address must be added before submitting this order.");
        } else if (!this.record.itemsStore.count()) {
            isValid = false;
            errors.push("Products must be added before submitting this order. Click the \"Edit Details\" button to add products.");
        }

        //else if (!this.record.data.fulfillmentContact || !this.record.data.fulfillmentContact.email) {
        //    isValid = false;
        //    errors.push("A shipping address must be created or selected before saving this order");
        //}
        else if (isShippable && !this.record.get("shippingMethodCode")) {
            isValid = false;
            errors.push("A shipping method must be selected before submitting this order");
        }
        
        if (errors.length) {
            Taco.app.fireEvent('setmessage', errors.join("<br/>"), 'error', me);
        }

        // fire an event so that the editor wrapper can reenable the save button;
        this.fireEvent('beforesavefailure', me, errors);


        return isValid;
    },

    beforeSave: function () {        
        var retVal = this.isValid();        
        return retVal
    },

    addSaveTasks: function (tasks) {
        var me = this;

        tasks.add({ 
            key: 'submitorder',
            fn: function (task) {
                Ext.Ajax.request({
                    url: '/admin/app/order/submit',
                    method: 'POST',
                    jsonData: {
                        orderId: me.record.getId()
                    },
                    success: function () {                        
                        //alert("Your order was created! Yay! You should probably close this window now.");
                        task.callback();                        
                    },
                    failure: function () {
                        task.callback(true);
                    }
                });
            }
        });
        return tasks;
    }
})
