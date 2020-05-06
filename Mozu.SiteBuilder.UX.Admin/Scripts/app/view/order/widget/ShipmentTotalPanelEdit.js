Ext.define('Taco.view.order.widget.ShipmentTotalPanelEdit', {
    extend: 'Taco.view.order.widget.ShipmentTotalPanel',
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
                                case "shipmentAdjustment":
                                    me.fireEvent("clearShipmentAdjustment");
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

    getBtnDefaults: function(me, field) {
        var btn = {};
        var isAmountNegative = (field.get('adjustmentAmount') <= 0 );
        btn.text = me.getAdjustmentText(isAmountNegative, field);
        btn.value = (isAmountNegative) ? -1 : 1;
        return btn;
    },

    
    createAdjustmentFields: function() {
        var me = this;

        me.store.each(function(field){

            var adjustmentTotal = me.masterTable.el.down("[itemId = " + field.get("adjustmentId") + "Total]");

            if(adjustmentTotal) {
                adjustmentTotal.update("");
        
                var adjustmentTotalDisplay = Ext.widget({
                    xtype: 'component',
                    itemId: 'adjustmentTotal-' + field.get('id'),
                    style: {
                        'text-align' : 'right',
                        'padding' : '10px'
                    },
                    cls: Taco.baseCSSPrefix + 'adjustmentTotal',
                    html: field.formatCurrency(field.get('adjustedTotal')),
                    autoEl: {
                        tag: 'span'
                    },
                    renderTo: adjustmentTotal
                });

            var adjustmentLabel = me.masterTable.el.down("[itemId = " + field.get("adjustmentId") + "Label]");
            if(adjustmentLabel) {
                adjustmentLabel.update("");

                var defaultButton = me.getBtnDefaults(me, field);

                var adjustment = field.get('adjustmentAmount')
                var adjustmentLabelButton = new Ext.button.Button({
                    itemId: field.get("id") + "AdjustmentLabelButton",
                    ui: "action",
                    scale: "medium",
                    menuAlign: 'tr-br?',
                    text: defaultButton.text,
                    value: defaultButton.value,
                    menu: {
                        plain: true,
                        listeners: {
                            click: {
                                fn: function (menu, item, e, eOpts) {
                                    if (item && field) {
                                        me.handleNegativeAdjustmentChange(menu, field, item.value, adjustmentTotalDisplay);
                                    }
                                },
                                scope: me,
                                delegate: "x-menu-item-link"
                            }
                        },
                        items: [
                            {
                                text: me.getAdjustmentText(true, field),
                                type: "shippingAdjustmentIsNegative",
                                value: -1
                            },
                            {
                                text: me.getAdjustmentText(false, field),
                                type: "shippingAdjustmentIsNegative",
                                value: 1
                            }
                        ]
                    },
                    renderTo: adjustmentLabel
                });
            

            var adjustmentField = me.masterTable.el.down("[itemId = " + field.get("adjustmentId") + "Field]");
            if(adjustmentField) {
                adjustmentField.update("");
            
            
                var adjustmentValue = Math.abs(field.get('adjustmentAmount'));
                adjustmentValue = Ext.util.Format.number(adjustmentValue, ",0.00");

                var adjustmentFieldInput = Ext.widget({
                    currencyCode: me.record.getCurrencyCode(),
                    xtype: "currencyfield",
                    spinUpEnabled: false,
                    spinDownEnabled: false,
                    width: 96,
                    selectOnFocus: true,
                    minValue: 0,
                    forcePrecision: true,
                    renderTo: adjustmentField,
                    value: adjustmentValue
                });

                me.mon(adjustmentFieldInput, 'blur', me.onShipmentAdjustmentChange, me, {field: field, btn:adjustmentLabelButton ,label: adjustmentTotalDisplay});
            }

            }
            
            }
        });
    },

    initTableComponents : function () {
        var me = this;

        // need to hard code the field with for numberfield because there is a bug in Extjs sizing logic that sets this to a minimum of 150 px;
        var fieldWidth = 96;

        this.createAdjustmentFields();
    },

    onShipmentAdjustmentChange: function (ctl, evt, params) {
            // check to see if there is a persitable change;
            var me = this;
            var adjustmentLabelButton = params.btn;
            var adjustmentField = ctl;
            var adjustment = adjustmentField.getValue();

            adjustment = adjustment * adjustmentLabelButton.value;
            
            adjustment = parseFloat(adjustment);
            params.field.set("adjustmentAmount", adjustment);
            me.updateAdjustmentTotals(params.field, params.label);
    },

    updateAdjustmentTotals: function(field, cmp) {
        var me = this;
        cmp.update(field.formatCurrency(field.get('adjustedTotal')));
    },

    getAdjustmentText: function (value, field){
        var subtractLabelText = "Subtract from " + field.get('name');
        var addLabelText = "Add to "  + field.get('name');
        return (value) ? subtractLabelText : addLabelText;
    },

  
    handleNegativeAdjustmentChange: function (menu, field, newValue, totalCmp) {
        var me = this,
            oldValue = menu.ownerButton.value,
            fieldValue;

        if (oldValue == newValue) {
            return;
        }

        menu.ownerButton.setText(me.getAdjustmentText((newValue === -1) ? true : false, field));
        menu.ownerButton.value = newValue;

        var adjustment = field.get('adjustmentAmount');

        if(adjustment < 0){
            if(newValue === 1) {
                adjustment = adjustment * -1;
            }
        } else {
            adjustment = adjustment * newValue;
        }

        adjustment = parseFloat(adjustment);
        field.set("adjustmentAmount", adjustment);
        me.updateAdjustmentTotals(field, totalCmp);
    },

    initUI: function () {
        var me = this,
            isEditable = me.isEditable,
            flex = (isEditable) ? .5 : 1;

        this.initLeftPanel();

        this.masterTable = Ext.create("Ext.Component", {
            data: me.shipmentRecord,
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
                flex: 1,
                items: [
                    this.masterTable
                ]
            }
        ];
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
                priceCls: "price-detail-shipment "
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

        if (me.shipmentAdjustmentFieldInput &&me.shipmentAdjustmentFieldInput.getValue() != me.shipmentAdjustmentFieldInput.originalValue) {
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