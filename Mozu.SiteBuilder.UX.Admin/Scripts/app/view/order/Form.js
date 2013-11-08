/**
 * @class Taco.view.order.Form
 */
Ext.define('Taco.view.order.Form', {
    extend: 'Taco.core.ux.form.NavForm2',

    topOffset: 38,

    requires: [
        'Taco.model.Order',
        'Taco.model.OrderPayment',
        'Taco.view.order.Header',
        'Taco.view.order.subform.Customer',
        'Taco.view.order.subform.Detail',
        'Taco.view.order.subform.Payment',
        'Taco.view.order.subform.Shipping',
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
            '{status}',
        '</span>'
    ],

    createTitle: [
        'Create Order No. {number}',
        '<span class="taco-order-status">',
            '{status}',
        '</span>'
    ],

    initComponent: function () {
        var me = this;

        
        // after the record is reloaded we will need to refresh the ui
        me.record.on("aftercommit", function () {
            me.onRecordChange();
        }, this);
        
        // after the record is reloaded we will need to refresh the ui
        me.record.on("reload", function () {
            me.onBeforeReload();
        }, this);
        
        this.customer = {};

        this.updateTitleData();

        this.buildForm();

        this.callParent(arguments);
        
        this.shippingForm = this.down('taco-ordershippingsimple');
        this.customerForm = this.down('taco-ordercustomer');
        this.orderDetail = this.down('taco-orderdetail');

        this.loadNavItems();

        
    },
    
    onBeforeReload : function() {
        //save the scrollTop position so that the main form container will be able to restore the scroll position
        var scrollPanel = this.el.up(".taco-content-body").el.dom;
        this.record.scrollTopTarget = scrollPanel.scrollTop;
        
    },
    
    updateTitleData: function () {
        this.titleData = {
            number: this.record.get('orderNumber'),
            status: this.record.get('orderStatus')
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
                orderForm: this,
                listeners: {
                    orderchange: function () {
                        this.savableStateCheck();
                        if (this.shippingForm) {
                            this.shippingForm.loadShippingMethods();
                        }
                    },
                    scope: this
                }
            },
            items = [];

        if (this.isEdit()) {
            items.push(Ext.create('Taco.view.order.Header', subformCfg));
        }

        if (!this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.Customer', subformCfg));
        }

        items.push(Ext.create('Taco.view.order.subform.Detail', subformCfg));

        if (!this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.ShippingSimple', subformCfg));
        }
      
        items.push(Ext.create('Taco.view.order.subform.Payment', subformCfg));
      
        if (this.isEdit()) {
            items.push(Ext.create('Taco.view.order.subform.Shipping', subformCfg));
            items.push(Ext.create('Taco.view.order.subform.Return', subformCfg)); 
        }

        items.push(Ext.create('Taco.shared.view.form.ExtensibleAttribute', {
            title: 'Order Attributes',
            record: this.record,
            attributeDefinitionStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.OrderAttributes')
        }));

        this.items = items;

        

        

    },

    isEdit: function () {
        if (this._isEdit === undefined) {
            this._isEdit = this.record.get('orderStatus') !== 'Created';
        }
        return this._isEdit;
    },

    isValid: function () {
        // Only validate when in create mode
        if (this.isEdit()) return false;
        
        // Check basic form fields
        if (!this.callParent(arguments)) return false;

        // Is customer valid?
        if (!this.customerForm.isValid()) return false;

        // Is Shipping Valid?
        if (!this.shippingForm.isValid()) return false;

        // Is Payment valid?
        // if (!this.paymentForm.isValid()) return false;

        // Is Order Item valid?
        // if (!this.orderDetail.isValid()) return false;

        return true;
    },

    addSaveTasks: function(tasks) {
        var me = this;

        tasks.add({ 
            key: 'submitorder',
            fn: function() {
                Ext.Ajax.request({
                    url: '/admin/app/order/submit',
                    method: 'POST',
                    jsonData: { orderId: me.record.getId() },
                    success: function() {
                        alert("Your order was created! Yay! You should probably close this window now.");
                        // tasks.callback();
                    },
                    failure: function() {
                        tasks.callback(true);
                    }
                });
            }
        });
        return tasks;
    }
})
