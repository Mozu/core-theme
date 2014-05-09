/**
 * @class Taco.view.order.widget.OrderTotalPanel
 * panel for display of subtotal, discounts, shipping, tax, and order total
 * used in the OrderDetail and OrderDetailEditor
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
         * data from the order     
         */
        data: null,
        /**
         * width of the row total column in the associated order item grid. this keeps the labels and values aligned with the associate gdrid;   
         */
        totalColumnWidth: 100,
        /**
         * width of the actions column in the associated order item grid. this keeps the labels and values aligned with the associated grid;   
         */
        actionColumnWidth: 30,

        discountsPerPage : 50,
        
        isEditable: true
    },

    initComponent: function(eOpts) {
        var me = this;
        me.callParent(arguments);        
        
        this.masterTable.on('render', function () {
            
            this.initTableComponents()



        }, this)

        


        if (me.isEditable) {
            this.masterTable.on({
                keydown: {
                    element: 'el',
                    fn: function (e, t, eOpts) {
                        if (e.getKey() == e.ENTER) {
                            var target = Ext.fly(t);
                            if (target.hasCls("taco-order-adjustment-cell")){
                                //debugger;
                                me.onEditAdjustmentStart("order")
                            } else if (target.hasCls("taco-shipping-adjustment-cell")){
                                //debugger;
                                me.onEditAdjustmentStart("shipping")
                            };
                        }
                    }
                },
                click: {
                    element: 'el',
                    fn: function (e, t, eOpts) {
                        
                        var action = t.getAttribute("action");
                        if (action) {
                            switch (action) {
                                case "editShippingAdjustment":
                                    this.onEditAdjustmentStart("shipping",t);
                                    break
                                case "editOrderAdjustment":
                                    this.onEditAdjustmentStart("order", t);
                                    break
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

        var shippingAdustmentLabel = this.masterTable.el.down("[itemId = shippingAdustmentLabel]");
        shippingAdustmentLabel.update("");


        var subtractShippingLabelText = "Subtract from Shipping Total";
        var addShippingLabelText = "Add to Shipping Total";

        var shippingAdjustment = this.record.data.shippingAdjustment.amount
        var orderAdjustment = this.record.data.orderAdjustment.amount


        var shippingAdustmentLabelButton = new Ext.button.Button({
            ui: "action",
            scale: "medium",
            cls:"order-adjusment-menu",
            style: "font-size: 1.4rem;",
            text: (shippingAdjustment > 0) ? addShippingLabelText : subtractShippingLabelText,
            menu:

                //{
                //plain:true,
                //items: 
                [
                    {
                        text: subtractShippingLabelText
                    },
                    {
                        text: addShippingLabelText
                    }
                ]
                //}
            
            ,
            renderTo: shippingAdustmentLabel
        })



        var orderAdustmentLabel = this.masterTable.el.down("[itemId = orderAdustmentLabel]");
        orderAdustmentLabel.update("");


        var subtractOrderLabelText = "Subtract from Order Total";
        var addOrderLabelText = "Add to Order Total";

        var orderAdustmentLabelButton = new Ext.button.Button({
            ui: "action",
            scale: "medium",
            cls: "order-adjusment-menu",
            style: "font-size: 1.4rem;",
            text: (orderAdjustment > 0) ? addOrderLabelText : subtractOrderLabelText,
            menu: {
                plain: true,
                items: [
                    {
                        text: subtractOrderLabelText
                    },
                    {
                        text: addOrderLabelText
                    }
                ],
            },
            renderTo: orderAdustmentLabel
        })


        // need to hard code the field with for numberfield because there is a bug in Extjs sizing logic that sets this to a minimum of 150 px;
        var fieldWidth = 96;

        var orderAdustmentField = this.masterTable.el.down("[itemId = orderAdustmentField]");
        orderAdustmentField.update("");
        var orderAdjustmentValue  =  Math.abs(this.record.data.orderAdjustment.amount);
        orderAdjustmentValue = Ext.util.Format.number(orderAdjustmentValue, ",0.00");

        var orderAdustmentFieldInput = Ext.widget({
            xtype: "currencyfield",
            emptyText: "$0.00",
            width: fieldWidth,
            selectOnFocus: true,
            minValue:0,
            forcePrecision:true,
            renderTo: orderAdustmentField,
            value: orderAdjustmentValue
        });

        var shippingAdustmentField = this.masterTable.el.down("[itemId = shippingAdustmentField]");
        shippingAdustmentField.update("");
        var shippingAdjustmentValue = Math.abs(this.record.data.shippingAdjustment.amount);
        shippingAdjustmentValue = Ext.util.Format.number(shippingAdjustmentValue, ",0.00");


        var shippingAdustmentFieldInput = Ext.widget({
            emptyText: "$0.00",
            xtype:"currencyfield",
            width: fieldWidth,
            selectOnFocus: true,
            minValue: 0,
            forcePrecision:true,
            renderTo: shippingAdustmentField,
            value: shippingAdjustmentValue
        });


    },

    initXTemplates: function (){
        
        // add support to XTemplate for subTemplates






        //this.masterTpl = new Ext.XTemplate();

    },

    initUI: function () {
        var me = this,
            isEditable = me.getIsEditable(),
            flex = (isEditable) ? .5 : 1;

        this.initLeftPanel();

        this.initXTemplates()

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

    onEditAdjustmentStart: function (type, target) {
        
        var el = Ext.fly(target),
            size = el.getSize();

        var editor = new Ext.Editor({
            updateEl: true,
            //height: size.height,
            //width: size.width,
            autoSize: true,
            alignment: "tr-tr?",
            value:4.25,
            field: {
                xtype: 'numberfield',                
                forcePrecision: true,
                selectOnFocus: true,
                hideTrigger: true,
                fieldStyle: "text-align:right;padding-right:4px;",
                mouseWheelEnabled: false,
                minValue: 0,
                maxValue: 100000
            }
        })
        
        editor.startEdit(el);


    },

    onEditAdjustmentSave: function (type) {

    },

    onEditAdjustmentCancel: function (type) {

    },

    initLeftPanel : function (){
        //this.couponCombo = 

        this.initCouponCombo();

        this.leftPanel = Ext.create("Ext.container.Container", {
            cls: "orderform-detail-totalpanel-leftpanel",
            //style:"background-color:red",
            layout:{
                type: 'form'
            },
            items: [
                this.couponCombo
            ],
            flex: .5
        });

    },

    initCouponCombo: function () {
        var me = this;
        
        this.couponCombo = Ext.create('Taco.view.order.widget.DiscountPickerField', {
            fieldCls: "toolbar-field",
            flex:1,
            validOnDate: this.record.get("createDate"),
            hideLabel :false,
            fieldLabel: "Add Discount or Coupon (Order, Item, or Shipping)",
            labelStyle:"padding-top:5px;",
            emptyText:"Add Discount or Coupon",
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Discounts',
                pageSize: me.discountsPerPage,
                autoLoad: true
            }),
            pageSize: me.discountsPerPage,
            listeners: {
                beforeselect: {
                    fn: function (combo, record, index, e) {

                        //var picker = combo.getPicker();
                        combo.collapse();

                        // the product doesn't require configuration so just add it and skip opening the dialog;
                        this.addOrderCoupon([
                           record.get("couponCode")
                        ]);

                        // cancel the selection so that the same product can be reselected again;
                        return false;
                    },
                    scope: this
                }
            }
        });
    },


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

    getAddAdjustmentToolbar: function (config) {
        var me = this,
            tbConfig,
            orderAdjustmentValue,
            shippingAdjustmentValue;

        orderAdjustmentValue = me.record.get("orderAdjustment").amount;
        shippingAdjustmentValue = me.record.get("shippingAdjustment").amount;

        //this.activeSearchField = Ext.create('Taco.core.ux.form.CurrencyField', {
        /*
        this.activeSearchField = Ext.create('Ext.form.field.Number', {
            label: "Order Adjustment",
            itemId: "orderAdjustmentField",
            width: 80,
            fieldCls: "toolbar-field",
            selectOnFocus: true,
            forcePrecision: true,
            listeners: {
                focus: {
                    fn: function (field) {
                        if (!field.getValue()) {
                            field.setValue("-");
                        }
                    },
                    scope: me
                }

            },
            hideTrigger: true,
            decimalPrecision: 2,
            value: orderAdjustmentValue
        });

        */


        tbConfig = Ext.apply({
            toolbarType: "orderAdjustment",
            items: [
                {
                    xtype: 'component',
                    html: "Order Adjustment",
                    style: "padding:0px 10px 0px 10px;"
                },
                this.activeSearchField,
                {
                    xtype: 'component',
                    html: "Shipping Adjustment",
                    style: "padding:0px 10px 0px 30px;"
                },
                {
                    xtype: "numberfield",
                    itemId: "shippingAdjustmentField",
                    forcePrecision: true,
                    width: 80,
                    style: "margin:0px 10px 0px 10px;top:0px;",
                    fieldCls: "toolbar-field",
                    selectOnFocus: true,
                    hideTrigger: true,
                    decimalPrecision: 2,
                    value: shippingAdjustmentValue
                },
                {
                    xtype: "button",
                    scale: "medium",
                    ui: "action",
                    text: "Apply",
                    itemId: "applyadjustmentField",
                    style: "margin:0px 20px 0px 10px;",
                    handler: function (button, e) {

                        var orderAdjustmentField = button.up('toolbar').getComponent('orderAdjustmentField');
                        var shippingAdjustmentField = button.up('toolbar').getComponent('shippingAdjustmentField');

                        // get the values from the fields and persist the adjustments;
                        me.updateOrderAdjustment({
                            data: {
                                orderAdjustment: {
                                    amount: orderAdjustmentField.getValue()
                                },
                                shippingAdjustment: {
                                    amount: shippingAdjustmentField.getValue()
                                }
                            }
                        })

                    },
                    scope: me
                },
                "->"

            ]
        }, config);

        return me.getAddItemToolbar(tbConfig);
    },
    
    // when the data gets updated apply the new data to the two subComponents;
    updateData: function (newValue, oldValue) {
        var me = this;
        if (newValue) {
            this.masterTable.update(newValue);
        }
    },
    
    /**
     * Do any class level cleanup. Destroy and null any scoped refs.     
     */
    onDestroy : function() {
        this.callParent(arguments);
    }
});