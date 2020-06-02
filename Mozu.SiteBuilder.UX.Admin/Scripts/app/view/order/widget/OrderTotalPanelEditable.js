/**
 * @class Taco.view.order.widget.OrderTotalPanel
 * panel for display of subtotal, discounts, shipping, tax, and order total
 * used in OrderDetailEditor
 * this is the editable version
 * see OrderTotalPanel.js for the readOnly baseClass used in the orderDetail view.
 */
Ext.define('Taco.view.order.widget.OrderTotalPanelEditable', {
    extend: 'Taco.view.order.widget.OrderTotalPanel',
    requires: ['Taco.view.order.widget.DiscountPickerField', 'Taco.view.order.widget.PriceListPickerField', 'Taco.store.Discounts', 'Taco.core.ux.form.CurrencyField', 'Ext.button.Button'],
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
        discountsPerPage: 50,

        priceListStore: null,
        priceListName: ''
    },

    isEditable: true,

    /**
     * width of the actions column in the associated order item grid. this keeps the labels and values aligned with the associated grid;
     */
    actionColumnWidth: 50,

    initComponent: function(eOpts) {
        var me = this;
        me.callParent(arguments);

        me.mon(this.masterTable, 'render', function() {
            this.initTableComponents();
        }, this);

        if (me.isEditable) {
            me.mon(this.masterTable, {
                click: {
                    element: 'el',
                    fn: function (e, t, eOpts) {
                        var action = t.getAttribute("action");
                        if (action) {
                            switch (action) {
                                case "shippingAdjustment":
                                    me.fireEvent("clearShippingAdjustment");
                                    break;
                                case "orderAdjustment":
                                    me.fireEvent("clearOrderAdjustment");
                                    break;
                                case "handlingAdjustment":
                                    me.fireEvent("clearHandlingAdjustment");
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

    initTableComponents : function () {
        var me = this;

        // need to hard code the field with for numberfield because there is a bug in Extjs sizing logic that sets this to a minimum of 150 px;
        var fieldWidth = 96;

        // Order Adjustment

        var orderAdjustmentLabel = this.masterTable.el.down("[itemId = orderAdjustmentLabel]");
        // remove the read only version of the text label
        orderAdjustmentLabel.update("");

        var orderAdjustment = this.record.data.orderAdjustment.amount;

        var subtractOrderLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.subtract_from_order;
        var addOrderLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_add;

        this.orderAdjustmentLabelButton = new Ext.button.Button({
            ui: "action",
            scale: "medium",
            //cls: "order-adjusment-menu",
            //style: "font-size: 1.4rem;",
            menuAlign: 'tr-br?',
            requiredBehaviors: [{
                model: 'Taco.model.Order',
                behavior: 'update',
                disable: true
            },
            {
                model: 'Taco.model.Order',
                behavior: 'manualAdjustment'
            }],
            text: (orderAdjustment > 0) ? addOrderLabelText : subtractOrderLabelText,
            disabled: !this.isOrderEditable(),
            menu: {
                plain: true,
                listeners: {
                    click: {
                        fn: function (menu, item, e, eOpts) {
                            if (item && item.type) {
                                me.handleNegativeAdjustmentChange(item.type, item.value);
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
        });


        var orderAdjustmentField = this.masterTable.el.down("[itemId = orderAdjustmentField]");
        orderAdjustmentField.update("");
        var orderAdjustmentValue = Math.abs(this.record.data.orderAdjustment.amount);
        orderAdjustmentValue = Ext.util.Format.number(orderAdjustmentValue, ",0.00");

        this.orderAdjustmentFieldInput = Ext.widget({
            currencyCode: this.record.getCurrencyCode(),
            xtype: "currencyfield",
            spinUpEnabled: false,
            spinDownEnabled: false,
            emptyText: this.record.formatCurrency(0),
            width: fieldWidth,
            selectOnFocus: true,
            minValue: 0,
            forcePrecision: true,
            renderTo: orderAdjustmentField,
            value: orderAdjustmentValue,
            disabled: !this.isOrderEditable(),
            requiredBehaviors: [{
                model: 'Taco.model.Order',
                behavior: 'update',
                readOnly: true
            },
            {
                model: 'Taco.model.Order',
                behavior: 'manualAdjustment'
            }]
        });

        me.mon(me.orderAdjustmentFieldInput, 'blur', me.onOrderAdjustmentChange, me);
        me.mon(me.orderAdjustmentFieldInput, 'specialkey', function (field, e) {
            if (e.getKey() == e.ENTER) {
                me.onOrderAdjustmentChange();
            }
        }, me);

        // Shipping Adjustment
        if (this.isOrderEditable()) {
            var shippingAdjustmentLabel = this.masterTable.el.down("[itemId = shippingAdjustmentLabel]");
            shippingAdjustmentLabel.update("");

            var shippingAdjustment = this.record.data.shippingAdjustment.amount;
            this.shippingAdjustmentLabelButton = new Ext.button.Button({
                ui: "action",
                scale: "medium",
                //cls:"order-adjusment-menu",
                //style: "font-size: 1.4rem;",
                menuAlign: 'tr-br?',
                requiredBehaviors: [{
                    model: 'Taco.model.Order',
                    behavior: 'update',
                    disable: true
                },
                {
                    model: 'Taco.model.Order',
                    behavior: 'manualAdjustment'
                }],
                text: me.getShippingAdjustmentText(this.record.get("shippingAdjustmentIsNegative")),
                menu: {
                    plain: true,
                    listeners: {
                        click: {
                            fn: function (menu, item, e, eOpts) {
                                if (item && item.type) {
                                    me.handleNegativeAdjustmentChange(item.type, item.value);
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
            });

            var shippingAdjustmentField = this.masterTable.el.down("[itemId = shippingAdjustmentField]");
            shippingAdjustmentField.update("");
            var shippingAdjustmentValue = Math.abs(this.record.data.shippingAdjustment.amount);
            shippingAdjustmentValue = Ext.util.Format.number(shippingAdjustmentValue, ",0.00");

            this.shippingAdjustmentFieldInput = Ext.widget({
                currencyCode: this.record.getCurrencyCode(),
                xtype: "currencyfield",
                spinUpEnabled: false,
                spinDownEnabled: false,
                width: fieldWidth,
                selectOnFocus: true,
                minValue: 0,
                forcePrecision: true,
                renderTo: shippingAdjustmentField,
                value: shippingAdjustmentValue
            });

            me.mon(me.shippingAdjustmentFieldInput, 'blur', me.onOrderAdjustmentChange, me);
            me.mon(me.shippingAdjustmentFieldInput, 'specialkey', function (field, e) {
                if (e.getKey() == e.ENTER) {
                    me.onOrderAdjustmentChange();
                }
            }, me);

            // Handling Adjustment

            var handlingAdjustmentLabel = this.masterTable.el.down("[itemId = handlingAdjustmentLabel]");
            handlingAdjustmentLabel.update("");

            var handlingAdjustment = this.record.data.handlingAdjustment.amount;
            this.handlingAdjustmentLabelButton = new Ext.button.Button({
                ui: "action",
                scale: "medium",
                //cls:"order-adjusment-menu",
                //style: "font-size: 1.4rem;",
                menuAlign: 'tr-br?',
                text: me.getHandlingAdjustmentText(this.record.get("handlingAdjustmentIsNegative")),
                menu: {
                    plain: true,
                    listeners: {
                        click: {
                            fn: function (menu, item, e, eOpts) {
                                if (item && item.type) {
                                    me.handleNegativeAdjustmentChange(item.type, item.value);
                                }
                            },
                            scope: me,
                            delegate: "x-menu-item-link"
                        }
                    },
                    items: [
                        {
                            text: me.getHandlingAdjustmentText(true),
                            type: "handlingAdjustmentIsNegative",
                            value: true
                        },
                        {
                            text: me.getHandlingAdjustmentText(false),
                            type: "handlingAdjustmentIsNegative",
                            value: false
                        }
                    ]
                },
                renderTo: handlingAdjustmentLabel
            });

            var handlingAdjustmentField = this.masterTable.el.down("[itemId = handlingAdjustmentField]");
            handlingAdjustmentField.update("");
            var handlingAdjustmentValue = Math.abs(this.record.data.handlingAdjustment.amount);
            handlingAdjustmentValue = Ext.util.Format.number(handlingAdjustmentValue, ",0.00");

            this.handlingAdjustmentFieldInput = Ext.widget({
                currencyCode: this.record.getCurrencyCode(),
                xtype: "currencyfield",
                spinUpEnabled: false,
                spinDownEnabled: false,
                width: fieldWidth,
                selectOnFocus: true,
                minValue: 0,
                forcePrecision: true,
                renderTo: handlingAdjustmentField,
                value: handlingAdjustmentValue,
                requiredBehaviors: [{
                    model: 'Taco.model.Order',
                    behavior: 'update',
                    readOnly: true
                },
                {
                    model: 'Taco.model.Order',
                    behavior: 'manualAdjustment'
                }]
            });

            me.mon(me.handlingAdjustmentFieldInput, 'blur', me.onOrderAdjustmentChange, me);
            me.mon(me.handlingAdjustmentFieldInput, 'specialkey', function (field, e) {
                if (e.getKey() == e.ENTER) {
                    me.onOrderAdjustmentChange();
                }
            }, me);
        }

    },

    onOrderAdjustmentChange: function () {
        if (this.isOrderEditable()) {
            // check to see if there is a persitable change;
            var me = this,
                shippingAdjustmentSign = (me.record.get("shippingAdjustmentIsNegative")) ? -1 : 1,
                shippingAdjustment = (Math.abs(parseFloat(this.shippingAdjustmentFieldInput.getValue())) * shippingAdjustmentSign),
                orderAdjustmentSign = (me.record.get("orderAdjustmentIsNegative")) ? -1 : 1,
                orderAdjustment = (Math.abs(parseFloat(this.orderAdjustmentFieldInput.getValue())) * orderAdjustmentSign),
                handlingAdjustmentSign = (me.record.get("handlingAdjustmentIsNegative")) ? -1 : 1,
                handlingAdjustment = (Math.abs(parseFloat(this.handlingAdjustmentFieldInput.getValue())) * handlingAdjustmentSign),
                isDirty = false

            if (me.record.get("orderAdjustment").amount != orderAdjustment) {
                isDirty = true;
            }

            if (me.record.get("shippingAdjustment").amount != shippingAdjustment) {
                isDirty = true;
            }

            if (me.record.get("handlingAdjustment").amount != handlingAdjustment) {
                isDirty = true;
            }
            // one of the adjustmentFields or the sign combos has changed and needs to be persisted;
            if (isDirty) {
                this.updateOrderAdjustment({
                    data: {
                        shippingAdjustment: {
                            amount: shippingAdjustment
                        },
                        orderAdjustment: {
                            amount: orderAdjustment
                        },
                        handlingAdjustment: {
                            amount: handlingAdjustment
                        }
                    }
                });
            }
        }
        else {
            // check to see if there is a persitable change;
            var me = this,
                orderAdjustmentSign = (me.record.get("orderAdjustmentIsNegative")) ? -1 : 1,
                orderAdjustment = (Math.abs(parseFloat(this.orderAdjustmentFieldInput.getValue())) * orderAdjustmentSign),
                isDirty = false

            if (me.record.get("orderAdjustment").amount != orderAdjustment) {
                isDirty = true;
            }

            // one of the adjustmentFields or the sign combos has changed and needs to be persisted;
            if (isDirty) {
                this.updateOrderAdjustment({
                    data: {
                        orderAdjustment: {
                            amount: orderAdjustment
                        }
                    }
                });
            }
        }
    },

    getShippingAdjustmentText: function (value){
        var subtractLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_subtract;
        var addLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.shipping_add;
        return (value) ? subtractLabelText : addLabelText;
    },

    getOrderAdjustmentText: function (value){
        var subtractLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_subtract;
        var addLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.order_add; 
        return (value) ? subtractLabelText : addLabelText;
    },

    getHandlingAdjustmentText: function (value) {
        var subtractLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.handling_subtract; 
        var addLabelText = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.EditDetailsPopup.handling_add; 
        return (value) ? subtractLabelText : addLabelText;
    },

    handleNegativeAdjustmentChange: function (name, newValue) {
        var me = this,
            oldValue = me.record.get(name),
            fieldValue;

        if (oldValue == newValue) {
            return;
        }
        me.record.set(name, newValue);

        if (name == "orderAdjustmentIsNegative") {
            // update the button text
            this.orderAdjustmentLabelButton.setText(me.getOrderAdjustmentText(newValue));
            fieldValue = parseFloat(this.orderAdjustmentFieldInput.getValue());
        } else if (name == "shippingAdjustmentIsNegative") {
            // update the button text
            this.shippingAdjustmentLabelButton.setText(me.getShippingAdjustmentText(newValue));
            fieldValue = parseFloat(this.shippingAdjustmentFieldInput.getValue());
        } else {
            // update the button text
            this.handlingAdjustmentLabelButton.setText(me.getHandlingAdjustmentText(newValue));
            fieldValue = parseFloat(this.handlingAdjustmentFieldInput.getValue());
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
                shippingAdjustment: Ext.clone(this.record.get("shippingAdjustment")),
                handlingAdjustment: Ext.clone(this.record.get("handlingAdjustment"))
            };

        // override the json data with passed in data
        if (config.data.orderAdjustment) {
            Ext.apply(jsonData.orderAdjustment, config.data.orderAdjustment);
        }

        if (config.data.shippingAdjustment) {
            Ext.apply(jsonData.shippingAdjustment, config.data.shippingAdjustment);
        }

        if (config.data.handlingAdjustment) {
            Ext.apply(jsonData.handlingAdjustment, config.data.handlingAdjustment);
        }

        this.fireEvent('save');

        this.record.updateOrderAdjustment({
            jsonData: jsonData,
            success: function (response) {
                // success handling here
                var json = Ext.decode(response.responseText, true);
                if (!json || !json.success) {
                    this.fireEvent('saveFailure');
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_adding_adjustments, 'error');
                    return;
                }

                if (this.isOrderEditable()) {
                    // need to reset the fields so that they don't show as dirty after the save
                    this.shippingAdjustmentFieldInput.originalValue = Ext.util.Format.number(this.shippingAdjustmentFieldInput.getValue(), "0.00");

                    this.handlingAdjustmentFieldInput.originalValue = Ext.util.Format.number(this.handlingAdjustmentFieldInput.getValue(), "0.00");
                }
                // need to reset the fields so that they don't show as dirty after the save
                this.orderAdjustmentFieldInput.originalValue = Ext.util.Format.number(this.orderAdjustmentFieldInput.getValue(), "0.00");                

                this.fireEvent('savesuccess', json);
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_adding_adjustments;
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
            tpl: me.getMasterTemplate(),
            listeners: {
                boxready: {
                    fn: function () {
                        me.initSummaryToggleButtons();
                    },
                    scope: me
                }
            }
        });

        this.items = [
            this.leftPanel,
            {
                xtype: "container",
                flex: .5,
                items: [
                    this.masterTable
                ]
            }
        ];
    },

    initLeftPanel : function (){
        var me = this;

        me.callParent(arguments);
        
        me.initCouponCombo();

        me.couponPanel = Ext.create("Ext.container.Container", {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            items: [me.couponCombo, me.couponApply]
        });
        me.leftPanel.add(me.couponPanel);
        me.leftPanel.add(me.couponError);

        var customerNotesText = me.record.get("customerNote");
        var giftMessageText = me.record.get("giftMessage");
        // todo: refactor editableDisplayField to allow for placeholder text
        var placeholder = "";
        if (!(this.record.get("orderStatus") == "Pending") && me.record.get("customerNote") == "") {
            placeholder = Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.none_provided;
        }

        me.initPriceListCombo();
        me.leftPanel.add(me.priceListCombo);

        me.customerNoteField = Ext.widget({
            xtype: "textarea",
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.customer_notes,
            value: customerNotesText,
            placeholder: placeholder,
            disabled: !this.isOrderEditable(),
            listeners: {
                blur: {
                    fn: me.onCustomerNoteChange,
                    scope: me
                }
            }
        });

        me.giftMessageField = Ext.widget({
            xtype: "textarea",
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.gift_message,
            value: giftMessageText,
            placeholder: placeholder,
            disabled: !this.isOrderEditable(),
            listeners: {
                blur: {
                    fn: me.onGiftMessageChange,
                    scope: me
                }
            }
        });

        me.leftPanel.add(me.customerNoteField);
        me.leftPanel.add(me.giftMessageField);
    },

    initPriceListCombo: function () {
        var me = this;

        function setNewPriceList(orderId, priceListCode) {
            me.fireEvent('save');

            me.record.setPriceList({
                jsonData: {
                    orderId: orderId,
                    priceListCode: priceListCode
                },
                success: function(response) {
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_price_list, 'error');
                        return;
                    }

                    me.fireEvent('saveSuccess', json);
                },
                failure: function(response) {
                    // Reset pricelist combo value.
                    me.priceListCombo.setValue(me.record.get('priceListCode'));
                    var json = Ext.decode(response.responseText, true),
                        msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_price_list;
                    Taco.app.fireEvent('setmessage', msg, 'error');
                    me.fireEvent('saveFailure');
                }
            });
        }

        function applyPriceList(combo, priceListRecord)
        {
            if (priceListRecord.get('filteredInStorefront')) {
                Ext.create('Taco.core.ux.window.Modal', {
                    autoShow: true,
                    width: 400,
                    height: 250,
                    primaryText: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Buttons.ok,
                    secondaryText: Localizer.langResources.ORDERS.Orders.OrderDetails.BulkActionButton.cancel,
                    doSave: function() {
                        this.saveSuccess(null);
                        setNewPriceList(me.record.getId(), priceListRecord.get('code'));
                    },
                    items: [
                        {
                            xtype: 'container',
                            flex: 1,
                            padding: '2 2',
                            items: [
                                {
                                    width: '100%', height: '100%', flex: 1,
                                    html: '<div>' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.exclusive_price_list + '</div>'
                                }
                            ]
                        }
                    ]
                });
            } else {
                setNewPriceList(me.record.getId(), priceListRecord.get('code'));
            }
        }

        this.priceListCombo = Ext.create('Taco.view.order.widget.PriceListPickerField', {
            flex: 1,
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.price_list,
            labelStyle: "padding-top:16px;",

            emptyText: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.none,
            valueNotFoundText: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.none,
            editable: true,
            forceSelection: false,
            disabled: !this.isOrderEditable(),
            store: me.priceListStore,
            orderSiteId: me.record.get('siteId'),
            value: me.record.get('priceListCode'),
            requiredBehaviors: [{
                                model: 'Taco.model.Order',
                                behavior: 'update',
                                disable: true
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'updatePrice'
                            }],
            listeners: {
                select: {
                    fn: function (combo, records, opts) {
                        applyPriceList(combo, records[0]);
                    },
                    scope: me
                }
            }
        });
    },

    onCustomerNoteChange: function (field, e, eOpts) {
        if (field.isDirty()) {
            this.record.setCustomerNote({
                jsonData: {
                    orderId: this.record.getId(),
                    note: this.customerNoteField.getValue()
                },
                success: function(response) {
                    // success handling here
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        return;
                    }

                    // reset the orginal value of the field so that the isDirty flag is accurate;
                    this.customerNoteField.originalValue = this.customerNoteField.getValue();
                    this.fireEvent('saveSuccess', json);
                },
                failure: function(response) {
                    this.fireEvent('saveFailure');
                },
                scope: this
            });
        }
    },

    onGiftMessageChange: function (field, e, eOpts) {
        if (field.isDirty()) {
            this.record.setGiftMessage({
                jsonData: {
                    orderId: this.record.getId(),
                    note: this.giftMessageField.getValue()
                },
                success: function(response) {
                    // success handling here
                    var json = Ext.decode(response.responseText, true);
                    if (!json || !json.success) {
                        return;
                    }

                    // reset the orginal value of the field so that the isDirty flag is accurate;
                    this.giftMessageField.originalValue = this.giftMessageField.getValue();
                    this.fireEvent('saveSuccess', json);
                },
                failure: function(response) {
                    this.fireEvent('saveFailure');
                },
                scope: this
            });
        }
    },

    initCouponCombo: function () {
        var me = this;

        function tryToApplyCoupon(code)
        {
            if (code) {
                me.addOrderCoupon([code]);
                me.couponCombo.clearValue();
            }
        }

        this.couponCombo = Ext.create('Taco.view.order.widget.DiscountPickerField', {
            flex:1,
            padding: '0 8 0 0',
            validOnDate: this.record.get("createDate"),
            hideLabel: false,            
            fieldLabel: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.add_coupons + '<br/>' + Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.note_coupon_codes,
            labelStyle:"padding-top:16px;",
            emptyText: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.add_coupon,
            disabled: !this.isOrderEditable(),
            store: Taco.core.data.StoreManager.getOrCreate({
                type: 'Taco.store.Discounts',
                pageSize: me.discountsPerPage,
                autoLoad: true
            }),
            pageSize: me.discountsPerPage,
            displayField: 'couponCode',
            requiredBehaviors: [{
                                model: 'Taco.model.Order',
                                behavior: 'update',
                                disable: true
                            },
                            {
                                model: 'Taco.model.Order',
                                behavior: 'updateDiscount'
                            }],
            listeners: {
                beforeselect: {
                    fn: function (combo, record, index, e) {
                        combo.collapse();
                        tryToApplyCoupon(record.get("couponCode"));

                        // cancel the selection so that the same coupon can be reselected again;
                        return false;
                    }
                },
                // Disable the apply button if there's nothing to submit.
                change: function(combo, newValue) {
                    me.couponApply.setDisabled(!newValue);
                },
                specialkey: function (combo, e) {
                    if (e.getKey() == e.ENTER && !combo.isExpanded) {
                        tryToApplyCoupon(combo.getValue());
                    }
                }
            }
        });

        this.couponApply = Ext.create('Ext.button.Button', {
            ui: 'action',
            scale: 'medium',
            text: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Title.apply,
            disabled: true,
            requiredBehaviors: [{
                                model: 'Taco.model.Order',
                                behavior: 'update'
                            },
                           {
                               model: 'Taco.model.Order',
                               behavior: 'updateDiscount'
                           }],
            handler: function() {
                tryToApplyCoupon(me.couponCombo.getValue());
            }
        });

        this.couponError = Ext.widget({
            xtype: "component",
            hidden: true,
            cls: "taco-order-discount-error",
            html: ""
            //tpl: this.couponErrorTpl
        });
    },

    couponErrorTpl: new Ext.XTemplate(
        '<tpl for=".">',
            '<div>Coupon "{couponCode}": {reason}</div>',
        '</tpl>'
    ),

    // accepts an array of order coupons configuration data objects and calls the service to persist it.
    addOrderCoupon: function (coupons) {
        var me = this,
            couponList = coupons;
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
                    Taco.app.fireEvent('setmessage', Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_adding_coupon, 'error');
                    return;
                }

                var missing = me.getUnusedCoupons(json.items, couponList);
                
                var invalidCoupons = json.items.invalidCoupons.concat(missing);
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
                    msg = (json && json.message) ? json.message : Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.error_adding_coupon;
                Taco.app.fireEvent('setmessage', msg, 'error');
                this.fireEvent('saveFailure');
            },
            scope: this
        });
    },

    getUnusedCoupons: function(order, codes) {
        // TODO: This same logic is duplicated in the Core Theme (models-cart and models-checkout).
        // Don't double-report on any invalid codes.
        codes = Ext.Array.difference(codes, Ext.Array.pluck(order.invalidCoupons, "couponCode"));
        // Extract all the various coupon codes on the order.
        var appliedCoupons = []
            .concat(Ext.Array.pluck(order.orderDiscounts, "couponCode"))
            .concat(Ext.Array.pluck(order.shippingDiscounts, "couponCode"))
            .concat(Ext.Array.pluck(Ext.Array.flatten(Ext.Array.pluck(order.items, "discounts")), "couponCode"))
            .concat(Ext.Array.pluck(Ext.Array.flatten(Ext.Array.pluck(order.items, "shippingDiscounts")), "couponCode"));
        // Drop discounts with no coupon code defined.
        appliedCoupons = Ext.Array.filter(appliedCoupons, function(code) { return code; });
        // Get a unique list.
        appliedCoupons = Ext.Array.unique(appliedCoupons);
        // Figure out which codes aren't in use.
        var missing = Ext.Array.difference(codes, appliedCoupons);
        // Map missing codes to payload for display in error template.
        return missing.map(function(code) {
            return {
                couponCode: code,
                // Reason text pulled from PricingRuntime's DiscountHandler.
                reason: Localizer.langResources.ORDERS.Orders.OrderEdit.OrderDetails.Messages.valid_coupon_msg
                // Missing discountId, reasonCode, and createDate.
            };
        });
    },

    onShippingInfoChange: function () {
        this.fireEvent('savesuccess', this);
    },

    isOrderEditable: function () {        
        var orderStatus = this.record.get('orderStatus');
        if (orderStatus == 'Pending' || orderStatus == 'Abandoned')
            return true;
        else
            return false;
    },

    isOrderEditable: function () {
        var orderStatus = this.record.get('orderStatus');
        if (orderStatus == 'Pending' || orderStatus == 'Abandoned')
            return true;
        else
            return false;
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
                tdInnerCls: "taco-grid-cell-inner ",
                priceCls: "price-detail "
            });

            // do a quick check to make sure the component hasn't been destroyed;
            if (!this.masterTable || !this.masterTable.el) {
                return;
            }

            // update the sub XTemplates
            var subTpl_1_el = this.masterTable.el.down("[itemId = taco-subTpl_1]");
            var subTpl_2_el = this.masterTable.el.down("[itemId = taco-subTpl_2]");
            var subTpl_3_el = this.masterTable.el.down("[itemId = taco-subTpl_3]");
            var subTpl_4_el = this.masterTable.el.down("[itemId = taco-subTpl_4]");
            var subTpl_5_el = this.masterTable.el.down("[itemId = taco-subTpl_5]");
            var subTpl_6_el = this.masterTable.el.down("[itemId = taco-subTpl_6]");
            var subTpl_7_el = this.masterTable.el.down("[itemId = taco-subTpl_7]");
            var subTpl_8_el = this.masterTable.el.down("[itemId = taco-subTpl_8]");
            var subTpl_9_el = this.masterTable.el.down("[itemId = taco-subTpl_9]");
            var subTpl_10_el = this.masterTable.el.down("[itemId = taco-subTpl_10]");

            this["subTpl_1"].overwrite(subTpl_1_el, data);
            this["subTpl_2"].overwrite(subTpl_2_el, data);
            this["subTpl_3"].overwrite(subTpl_3_el, data);
            this["subTpl_4"].overwrite(subTpl_4_el, data);
            this["subTpl_5"].overwrite(subTpl_5_el, data);
            this["subTpl_6"].overwrite(subTpl_6_el, data);
            this["subTpl_7"].overwrite(subTpl_7_el, data);
            this["subTpl_8"].overwrite(subTpl_8_el, data);
            this["subTpl_9"].overwrite(subTpl_9_el, data);
            this["subTpl_10"].overwrite(subTpl_10_el, data);
            // update the ext components
            this.updateShippingMethodButton(record);
            // need to hide the coupon error unless the hide was deferred. This happens because the record updates after the application of the error.
            if (!this.deferCouponErrorhide) {
                this.couponError.hide();
            } else {
                // reset this deferral
                this.deferCouponErrorhide = false;
            }

            me.initSummaryToggleButtons();
        }

        return record;
    },

    // check to see if there is unpersisted content;
    needsToPersist: function () {
        var me = this;

        if (me.customerNoteField && me.customerNoteField.getValue() != me.customerNoteField.originalValue) {
            return true;
        }

        if (me.orderAdjustmentFieldInput &&me.orderAdjustmentFieldInput.getValue() != me.orderAdjustmentFieldInput.originalValue) {
            return true;
        }

        if (me.shippingAdjustmentFieldInput && me.shippingAdjustmentFieldInput.getValue() != me.shippingAdjustmentFieldInput.originalValue) {
            return true;
        }

        if (me.handlingAdjustmentFieldInput && me.handlingAdjustmentFieldInput.getValue() != me.handlingAdjustmentFieldInput.originalValue) {
            return true;
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