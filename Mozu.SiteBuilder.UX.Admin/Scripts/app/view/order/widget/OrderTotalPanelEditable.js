/**
 * @class Taco.view.order.widget.OrderTotalPanel
 * panel for display of subtotal, discounts, shipping, tax, and order total
 * used in OrderDetailEditor
 * this is the editable version
 * see OrderTotalPanel.js for the readOnly baseClass used in the orderDetail view.
 */
Ext.define('Taco.view.order.widget.OrderTotalPanelEditable', {
    extend: 'Taco.view.order.widget.OrderTotalPanel',
    requires: ['Taco.view.order.widget.DiscountPickerField', 'Taco.store.Discounts', 'Taco.core.ux.form.CurrencyField','Ext.button.Button'],
    layout: {
        type: 'hbox',
        align: 'stretch',
        pack: 'start'
    },

    defaults: { xtype: "component" },    

    config: {        
        /**
         * width of the row total column in the associated order item grid. this keeps the labels and values aligned with the associate gdrid;   
         */
        totalColumnWidth: 100,        

        /**
         * Number of discounts to display in each page of the discountPicker Combobox;
         */
        discountsPerPage : 50
    },

    isEditable: true,

    /**
         * width of the actions column in the associated order item grid. this keeps the labels and values aligned with the associated grid;   
         */
    actionColumnWidth: 30,

    initComponent: function(eOpts) {
        var me = this;
        me.callParent(arguments);        
        
        me.mon(this.masterTable, 'render', function () {
            this.initTableComponents()
        }, this)       


        if (me.isEditable) {
            me.mon(this.masterTable, {            
                click: {
                    element: 'el',
                    fn: function (e, t, eOpts) {                    
                        var action = t.getAttribute("action");
                        if (action) {
                            switch (action) {
                                case "shippingAdjustment":
                                    me.fireEvent("clearShippingAdjustment")                                    
                                    break;
                                case "orderAdjustment":
                                    me.fireEvent("clearOrderAdjustment")
                                    break;
                                case "processDiscount":
                                    me.fireEvent("processDiscount", {
                                        isActive: t.getAttribute("isActive"),
                                        discountId: t.getAttribute("discountId")
                                    });
                                    break;
                            }
                        }
                    },
                    scope: me
                }
            });
        }

    },

    initTableComponents : function (){
        var me = this;

        var shippingAdjustmentLabel = this.masterTable.el.down("[itemId = shippingAdjustmentLabel]");
        shippingAdjustmentLabel.update("");

        var shippingAdjustment = this.record.data.shippingAdjustment.amount
        var orderAdjustment = this.record.data.orderAdjustment.amount


        this.shippingAdjustmentLabelButton = new Ext.button.Button({
            ui: "action",
            scale: "medium",
            //cls:"order-adjusment-menu",
            //style: "font-size: 1.4rem;",
            text: me.getShippingAdjustmentText(this.record.get("shippingAdjustmentIsNegative")),
            menu: {
                plain:true,
                listeners: {
                    click: {
                        fn: function (menu, item, e, eOpts) {
                            if (item && item.type) {
                                me.handleNegativeAdjustmentChange(item.type, item.value)
                            }
                        },
                        scope: me,
                        delegate: "x-menu-item-link"
                    }
                },
                items: [
                    {
                        text: me.getShippingAdjustmentText(true),
                        type: "shippingAdjustmentIsNegative",
                        value: true
                    },
                    {
                        text: me.getShippingAdjustmentText(false),
                        type: "shippingAdjustmentIsNegative",
                        value: false
                    }
                ]
            },
            renderTo: shippingAdjustmentLabel
        })

        var orderAdjustmentLabel = this.masterTable.el.down("[itemId = orderAdjustmentLabel]");
        // remove the read only version of the text label 
        orderAdjustmentLabel.update("");
        
        var subtractOrderLabelText = "Subtract from Order Total";
        var addOrderLabelText = "Add to Order Total";

        this.orderAdjustmentLabelButton = new Ext.button.Button({
            ui: "action",
            scale: "medium",
            //cls: "order-adjusment-menu",
            //style: "font-size: 1.4rem;",
            text: (orderAdjustment > 0) ? addOrderLabelText : subtractOrderLabelText,
            menu: {
                plain:true,
                listeners: {
                    click: {
                        fn: function (menu, item, e, eOpts) {
                            if (item && item.type) {
                                me.handleNegativeAdjustmentChange(item.type, item.value)
                            }
                        },
                        scope: me,
                        delegate: "x-menu-item-link"
                    }
                },
                items: [
                    {
                        text: me.getOrderAdjustmentText(true),
                        type: "orderAdjustmentIsNegative",
                        value: true
                    },
                    {
                        text: me.getOrderAdjustmentText(false),
                        type: "orderAdjustmentIsNegative",
                        value: false
                    }
                ]
            },
            
            renderTo: orderAdjustmentLabel
        })


        // need to hard code the field with for numberfield because there is a bug in Extjs sizing logic that sets this to a minimum of 150 px;
        var fieldWidth = 96;

        var orderAdjustmentField = this.masterTable.el.down("[itemId = orderAdjustmentField]");
        orderAdjustmentField.update("");
        var orderAdjustmentValue  =  Math.abs(this.record.data.orderAdjustment.amount);
        orderAdjustmentValue = Ext.util.Format.number(orderAdjustmentValue, ",0.00");

        this.orderAdjustmentFieldInput = Ext.widget({
            currencyCode: this.record.getCurrencyCode(),
            xtype: "currencyfield",
            spinUpEnabled: false,
            spinDownEnabled: false,
            emptyText: this.record.formatCurrency(0),
            width: fieldWidth,
            selectOnFocus: true,
            minValue:0,
            forcePrecision:true,
            renderTo: orderAdjustmentField,
            value: orderAdjustmentValue
        });

        me.mon(me.orderAdjustmentFieldInput, 'blur', me.onOrderAdjustmentChange, me);
        me.mon(me.orderAdjustmentFieldInput, 'specialkey', function (field, e) {            
            if (e.getKey() == e.ENTER) {
                me.onOrderAdjustmentChange()
            }
        }, me);

        var shippingAdjustmentField = this.masterTable.el.down("[itemId = shippingAdjustmentField]");
        shippingAdjustmentField.update("");
        var shippingAdjustmentValue = Math.abs(this.record.data.shippingAdjustment.amount);
        shippingAdjustmentValue = Ext.util.Format.number(shippingAdjustmentValue, ",0.00");


        this.shippingAdjustmentFieldInput = Ext.widget({
           
            currencyCode : this.record.getCurrencyCode(),
            xtype: "currencyfield",            
            spinUpEnabled: false,
            spinDownEnabled: false,
            width: fieldWidth,
            selectOnFocus: true,
            minValue: 0,
            forcePrecision:true,
            renderTo: shippingAdjustmentField,
            value: shippingAdjustmentValue
        });

        me.mon(me.shippingAdjustmentFieldInput, 'blur', me.onOrderAdjustmentChange, me);
        
        me.mon(me.shippingAdjustmentFieldInput, 'specialkey', function (field, e) {
            
            if (e.getKey() == e.ENTER) {
                me.onOrderAdjustmentChange()
            }
        }, me);
        
    },

    onOrderAdjustmentChange: function () {
        // check to see if there is a persitable change;
        var me = this,
            shippingAdjustmentSign = (me.record.get("shippingAdjustmentIsNegative")) ? -1 : 1,
            shippingAdjustment = (Math.abs(parseFloat(this.shippingAdjustmentFieldInput.getValue())) * shippingAdjustmentSign),
            orderAdjustmentSign = (me.record.get("orderAdjustmentIsNegative")) ? -1 : 1,
            orderAdjustment = (Math.abs(parseFloat(this.orderAdjustmentFieldInput.getValue())) * orderAdjustmentSign),
            isDirty = false
        
        if (me.record.get("orderAdjustment").amount != orderAdjustment ){
            isDirty =true;
        }
        
        if (me.record.get("shippingAdjustment").amount != shippingAdjustment ){
            isDirty =true;
        }
        // one of the adjustmentFields or the sign combos has changed and needs to be persisted;
        if (isDirty) {
            this.updateOrderAdjustment({
                data : {            
                    shippingAdjustment : {
                        amount: shippingAdjustment
                    },
                    orderAdjustment : {
                        amount: orderAdjustment
                    }
                }
            })
        }
    },

    getShippingAdjustmentText: function (value){
        var subtractLabelText = "Subtract from Shipping Total";
        var addLabelText = "Add to Shipping Total";
        return (value) ? subtractLabelText : addLabelText;
    },

    getOrderAdjustmentText: function (value){
        var subtractLabelText = "Subtract from Order Total";
        var addLabelText = "Add to Order Total";
        return (value) ? subtractLabelText : addLabelText;
    },

    handleNegativeAdjustmentChange: function (name, newValue) {
        var me = this,
            oldValue = me.record.get(name),            
            fieldValue
                
        if (oldValue == newValue) {
            return
        }        
        me.record.set(name, newValue)       
        
        if (name == "orderAdjustmentIsNegative") {
            // update the button text
            this.orderAdjustmentLabelButton.setText(me.getOrderAdjustmentText(newValue));
            fieldValue = parseFloat(this.orderAdjustmentFieldInput.getValue())
            
        } else {
            // update the button text
            this.shippingAdjustmentLabelButton.setText(me.getShippingAdjustmentText(newValue));
            fieldValue = parseFloat(this.shippingAdjustmentFieldInput.getValue())
        }
        
        // Check to see if this change relates to a field value that needs to be persisted. If the value == 0 then this change has no impact.
        if (fieldValue && fieldValue == 0) {
            return;
        }
        
        // perist the change
        this.onOrderAdjustmentChange();
    },

    
    updateOrderAdjustment: function (config) {        
        var me = this,
            jsonData = {
                orderId: this.record.get('id'),
                orderAdjustment: Ext.clone(this.record.get("orderAdjustment")),
                shippingAdjustment: Ext.clone(this.record.get("shippingAdjustment"))
            };

        // override the json data with passed in data
        if (config.data.orderAdjustment) {
            Ext.apply(jsonData.orderAdjustment, config.data.orderAdjustment);
        }

        if (config.data.shippingAdjustment) {
            Ext.apply(jsonData.shippingAdjustment, config.data.shippingAdjustment);
        }

        this.fireEvent('save');

        this.record.updateOrderAdjustment({
            jsonData: jsonData,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    this.fireEvent('saveFailure');
                    Taco.app.fireEvent('setmessage', "Error adding adjustments", 'error');
                    return;
                }
                this.fireEvent('savesuccess', json);
                
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : "Error adding adjustments.";
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('savefailure');
            },
            scope: this
        });

    },




    initUI: function () {
        var me = this,
            isEditable = me.isEditable,
            flex = (isEditable) ? .5 : 1;

        this.initLeftPanel();

        

        /*
        this.supTotalTpl = Ext.create("Ext.Component", {
            data: me.getData(),
            flex: flex,
            tpl: this.getSubTotalTpl()
        });
        */

        this.masterTable = Ext.create("Ext.Component", {
            data: me.getData(),
            flex: flex,
            tpl: this.getMasterTemplate()
        });
        
        this.items = [
            this.leftPanel,
            {
                xtype:"container",
                flex:.5,
                items:[
                    this.masterTable
                ]
            }
        ];        
    },

    initLeftPanel : function (){
        var me = this;

        me.callParent(arguments);
        
        me.initCouponCombo();
        me.leftPanel.add(me.couponCombo);
        me.leftPanel.add(me.couponError);

        
        var customerNotesText = me.record.get("customerNote");
        // todo: refactor editableDisplayField to allow for placeholder text
        var placeholder = ""
        if (!(this.record.get("orderStatus") == "Pending") && me.record.get("customerNote") == "") {
            var placeholder = "None provided"
        }

        me.customerNoteField = Ext.widget({
            //xtype: (this.record.get("orderStatus") == "Pending") ? "textarea" : "editabledisplayfield",
            xtype: "textarea",
            fieldLabel: "Customer Notes",            
            value: customerNotesText,
            placeholder: placeholder,
            disabled: !(this.record.get("orderStatus") == "Pending"),
            listeners: {
                blur: {
                    fn: me.onCustomerNoteChange,
                    scope:me
                }
            }
        });        

        me.leftPanel.add(me.customerNoteField)

    },

    onCustomerNoteChange: function (field, e, eOpts) {


        if (field.isDirty()) {          
            this.record.setCustomerNote({
                jsonData: {
                    orderId: this.record.getId(),
                    note: this.customerNoteField.getValue()
                },
                success: function (response) {
                    // success handling here
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        return;
                    }
                    
                    // reset the orginal value of the field so that the isDirty flag is accurate;
                    this.customerNoteField.originalValue = this.customerNoteField.getValue();
                    this.fireEvent('saveSuccess', json);
                },
                failure: function (response) {
                    this.fireEvent('saveFailure');
                },
                scope: this
            })
        }
    },

    initCouponCombo: function () {
        var me = this;
        
        this.couponCombo = Ext.create('Taco.view.order.widget.DiscountPickerField', {            
            flex:1,
            validOnDate: this.record.get("createDate"),
            hideLabel :false,
            fieldLabel: "Add Coupon (Order, Item, or Shipping)",
            labelStyle:"padding-top:16px;",
            emptyText:"Add Coupon",
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Discounts',
                pageSize: me.discountsPerPage,
                autoLoad: true
            }),
            pageSize: me.discountsPerPage,
            listeners: {
                beforeselect: {
                    fn: function (combo, record, index, e) {
                        combo.collapse();
                        this.addOrderCoupon([
                           record.get("couponCode")
                        ]);

                        // cancel the selection so that the same coupon can be reselected again;
                        return false;
                    },
                    scope: this
                }
            }
        });

        
        this.couponError = Ext.widget({
            xtype: "component",            
            hidden: true,
            cls: "taco-order-discount-error",
            html:""
            //tpl: this.couponErrorTpl
        })
        
    },


    couponErrorTpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div>Coupon "{couponCode}": {reason}</div>',
        '</tpl>'
    ),

    // accepts an array of order coupons configuration data objects and calls the service to persist it.
    addOrderCoupon: function (coupons) {
        var me = this;        
        this.fireEvent('save');
        
        this.record.addOrderCoupon({
            jsonData: {
                orderId: this.record.get('id'),
                coupons: coupons
            },
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    Taco.app.fireEvent('setmessage', "Error adding coupon.", 'error');
                    return;
                }
                
                var invalidCoupons = json.items.invalidCoupons;
                if (invalidCoupons.length) {
                    var couponErrorTxt = this.couponErrorTpl.apply(invalidCoupons);
                    this.couponError.update(couponErrorTxt);
                    this.couponError.show();
                    this.deferCouponErrorhide = true;
                } else {
                    this.couponError.hide();
                }

                this.fireEvent('saveSuccess', json);
            },
            failure: function (response) {
                // error handling here
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : "Error adding coupon.";
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });

    },

    onShippingInfoChange: function () {
        this.fireEvent('savesuccess', this);        
    },


    applyRecord: function (record) {
        //this.updateData(record.getData());
        //this.masterTable.update(record.getData());
        
        var me = this;
        if (record) {

            var data = Ext.clone(record.getData());

            // add some css class variables to the data for use in the templates
            Ext.apply(data, {
                tdCls: "taco-grid-cell ",
                tdInnerCls: "taco-grid-cell-inner "
            });

            // do a quick check to make sure the component hasn't been destroyed;            
            if (!this.masterTable || !this.masterTable.el) {
                return;
            }

            // update the sub XTemplates
            var subTpl_1_el = this.masterTable.el.down("[itemId = taco-subTpl_1]");
            var subTpl_2_el = this.masterTable.el.down("[itemId = taco-subTpl_2]");
            var subTpl_3_el = this.masterTable.el.down("[itemId = taco-subTpl_3]");

            this["subTpl_1"].overwrite(subTpl_1_el, data);
            this["subTpl_2"].overwrite(subTpl_2_el, data);
            this["subTpl_3"].overwrite(subTpl_3_el, data);
            // update the ext components 
            this.updateShippingMethodButton(record);
            // need to hide the coupon error unless the hide was deferred. This happens because the record updates after the application of the error.
            if (!this.deferCouponErrorhide) {
                this.couponError.hide();
            } else {
                // reset this deferral
                this.deferCouponErrorhide = false;
            }
        }

        return record
    },

    // check to see if there is unpersisted content;
    needsToPersist: function () {
        var me = this;
        

        if (me.customerNoteField.getValue() != this.record.data.customerNote) {            
            return true;
        }

        if (me.orderAdjustmentFieldInput.getValue() != Math.abs(this.record.data.orderAdjustment.amount)) {            
            return true;
        }


        if (me.shippingAdjustmentFieldInput.getValue() != Math.abs(this.record.data.shippingAdjustment.amount)) {                    
            return true
        }

        return false;
    },

    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy : function() {
        this.callParent(arguments);
    }
});