/**
 * @class  Taco.view.discount.LimitationsForm
 * @author Travis Johnson
 * @description Discount Limitations Editor
 */
Ext.define('Taco.view.discount.LimitationsForm', {
    requires: [
        'Ext.data.UuidGenerator',
        'Ext.ux.form.field.BoxSelect',
        'Taco.core.ux.form.CurrencyField',
        'Taco.core.util.Validation',
        'Taco.core.ux.TooltipLabel'
    ],
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-limitations',
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'Discount Limitations',

    initComponent: function () {
        var me = this;

        this.maxDiscountLineItemValue = Ext.create('Taco.core.ux.form.CurrencyField', 
            Taco.core.ux.TooltipLabel.wrapConfig('discount.limitations.maximumDiscountValuePerRedemption', me, {
                name: 'maximumDiscountValuePerRedemption',
                itemId: 'maxDiscountValuePerRedemption',
                fieldLabel: "Max Discount Value (Per Redemption)",
                forcePrecision: true,
                labelAlign: 'top',
                width: 250,
                margin: "0px 20px 0px 0px",
                currencyCode: Taco.app.context.getCurrent().currencyCode,
                align: 'right',
                unitAtEnd: false,
                minValue: 0,
                hidden: this.record.get('scope') === 'Order',
                emptyText: 'Unlimited'
            })
        );

        this.maxDiscountOrderValue = Ext.create('Taco.core.ux.form.CurrencyField', {
            name: 'maximumDiscountValuePerOrder',
            itemId: 'maxDiscountValuePerOrder',
            fieldLabel: "Max Discount Value (Per Order)",
            forcePrecision: true,
            labelAlign: 'top',
            width: 250,
            currencyCode: Taco.app.context.getCurrent().currencyCode,
            align: 'right',
            unitAtEnd: false,
            minValue: 0,
            emptyText: 'Unlimited'
        });

        this.redemptionLimits = Ext.create('Ext.form.field.Number', 
            Taco.core.ux.TooltipLabel.wrapConfig('discount.limitations.maxRedemptionCount', me, {
                name: 'maxRedemptionCount',
                hideTrigger: true,
                width: 250,
                margin: "0px 20px 0px 0px",
                fieldLabel: 'Total Number of Redemptions ' + (this.record.get('currentRedemptionCount') ? '<br/><i>(current redemptions:&nbsp;' + this.record.get('currentRedemptionCount') + '</i>)' : ''),
                emptyText: 'Unlimited',
                minValue: 0
            }))
        ;

        this.maxRedemptionsPerOrder = Ext.create('Ext.form.field.Number', {
            name: 'maximumRedemptionsPerOrder',
            itemId: 'maxRedemptionsPerOrder',
            hideTrigger: true,
            width: 250,
            fieldLabel: 'Max Redemptions (Per Order)',
            hidden: this.record.get('scope') === 'Order',
            minValue: 0,
            emptyText: 'Unlimited'
        });

        this.redemptionContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: 520,
            defaults: {
                labelAlign: 'top',
                labelSeparator: ''
            },
            items: [this.redemptionLimits, this.maxRedemptionsPerOrder]
        });

        this.redemptionCountContainer = Ext.create('Ext.container.Container', {
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: 520,
            margin: "5px 0px 10px 0px",
            hidden: !this.record.get('currentRedemptionCount'),
            items: [
                {
                    xtype: 'label',
                    flex: 1,
                    cls: 'taco-readonly-display',
                    margin: "0px 20px 0px 0px",
                    text: "Already redeemed: " + this.record.get('currentRedemptionCount') 
                }
            ]
        });

        this.requiresCouponInput = Ext.create('Ext.form.field.Checkbox', {
            name: 'requiresCoupon',
            boxLabel: 'Create coupon',
            padding: {
                top:10
            },
            labelAlign: 'right',
            listeners: {
                change: function (cb, newValue) {
                    me.couponCodeBox[newValue ? 'show' : 'hide']();
                    me.couponCodeInput.setDisabled(!newValue);
                    me.couponCodeInput.validate();
                },
                scope: this
            }
        });

        this.couponCodeInput = Ext.create('Ext.form.field.Text', {
            name: 'couponCode',
            allowBlank: false,
            width: 520,
            validator: Taco.core.util.Validation.validateQueryString
        });

        this.couponCodeBox = Ext.create('Ext.form.FieldContainer', {
            layout: {
                type: 'hbox',
                align: 'top'
            },
            //fieldLabel:"Coupon Code",
            hidden: !(this.record.get('couponCode') || this.record.get('requiresCoupon')),
            items: [
                this.couponCodeInput,
                {
                    xtype: 'button',
                    scale: 'medium',
                    ui: 'action',
                    text: 'Random',
                    margin: '0 0 0 10',
                    handler: function () {
                        var randomizer = Ext.data.IdGenerator.get('uuid'),
                            code = randomizer.generate().replace(/[^0-9a-z]/g, "").substr(0, 8).toUpperCase();

                        this.couponCodeInput.setValue(code);
                    },
                    scope: this
                }
            ]
        });
        this.oneTimeUsePerShopper = Ext.create('Ext.form.field.Checkbox', {
            name: 'oneTimeUsePerShopper',
            boxLabel: 'Discount Can Be Redeemed One Time Per Shopper',
            checked: this.record.get('maximumUsesPerUser') === 1,
            listeners: {
                change: function (cb, newValue) {
                    this.record.set('maximumUsesPerUser', newValue ? 1 : null);
                },
                scope: this
            }
        });

        this.items = [
            {
                xtype: 'component',
                html: 'Discount limitations specify restrictions on discount and coupon redemption.',
                margin: '15 0 0 0'
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                width: 520,
                defaults: {
                    labelAlign: 'top',
                    labelSeparator: ''
                },
                items: [this.maxDiscountLineItemValue, this.maxDiscountOrderValue]
            },
            this.redemptionContainer,            
            this.redemptionCountContainer,
            this.requiresCouponInput,
            this.couponCodeBox,
            this.oneTimeUsePerShopper
        ];


        this.callParent(arguments);
    },

    //setFieldVisibility: function (isLineItem, appliesToShipping, discountType) {
    setFieldVisibility: function (scopeType, targetType, discountType) {
        var me = this,
            appliesToShipping = (targetType == "Shipping"),
            isOrder = (scopeType === 'Order'),
            isLineItem = (scopeType === 'LineItem'),
            orderMaxVisible = false,
            lineItemMaxVisible = false,
            orderMaxLabel,
            orderMaxLabelWhenOrder = "Max Discount Value",
            orderMaxLabelWhenInline = "Max Discount Value (Per Order)";




        if ((!isLineItem && !isOrder) || !targetType) {
            this.setVisible(false);
            return;
        } else {
            this.setVisible(true);
        }

        if (isLineItem) {
            orderMaxLabel = orderMaxLabelWhenInline;
            if (Ext.Array.contains(["Percentage", "FixedPrice","Free"], discountType)) {
                orderMaxVisible = true;
                lineItemMaxVisible = true;
            } else if (discountType == "Amount") {
                orderMaxVisible = true;
                lineItemMaxVisible = false;
            }
        } else {
            // order or not selected
            if (Ext.Array.contains(["Percentage", "FixedPrice", "Free"], discountType)) {
                orderMaxLabel = orderMaxLabelWhenOrder;
                orderMaxVisible = true;
                lineItemMaxVisible = false;
            } else if (discountType == "Amount") {
                orderMaxVisible = false;
                lineItemMaxVisible = false;
            } 
        }

        // need to update the label since it will be visible. the line item max never gets a label change. 
        if (orderMaxLabel) {
            me.maxDiscountOrderValue.setFieldLabel(orderMaxLabel);
        }

        //set the visibility of the order and lineitem max fields as defined above;
        me.maxDiscountOrderValue.setVisible(orderMaxVisible);
        me.maxDiscountLineItemValue.setVisible(lineItemMaxVisible);

        // need to reset the fields when they are hidden;
        if (!orderMaxVisible && me.maxDiscountOrderValue.getValue()) {
            me.maxDiscountOrderValue.setValue(null);
        }

        if (!lineItemMaxVisible && me.maxDiscountLineItemValue.getValue()) {
            me.maxDiscountLineItemValue.setValue(null);
        }

        me.maxRedemptionsPerOrder.setVisible(isLineItem);
        if (!isLineItem) {
            me.maxRedemptionsPerOrder.setValue(null);
        }
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }

    

   
});