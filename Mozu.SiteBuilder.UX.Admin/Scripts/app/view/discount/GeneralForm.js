/**
 * @class  Taco.view.discount.GeneralForm
 * @author Travis Johnson
 * @description Dicounts General Form
 */
Ext.define('Taco.view.discount.GeneralForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-general',
    require: [
        'Taco.core.ux.TooltipLabel'
    ],
    ui: 'subform',
    margin: '0 0 39 0',

    title: 'General',

    initComponent: function() {
        var me = this;

        this.nameInput = Ext.create('Ext.form.field.Text', {
            name: 'name',
            fieldLabel: "Name",
            labelAlign: 'top',
            allowBlank: false,
            width: 600,
            enforceMaxLength: true,
            maxLength: 80,
            emptyText: 'Enter a discount name'
        });

        this.descriptionInput = Ext.widget('htmleditor', {
            enableFont: false,
            fieldLabel: 'Description',
            name: 'friendlyDescription',
            width: 600,
            height: 120,

            listeners: {
                // sync changes from code view of the htmleditor to WYSIWYG view
                editmodechange: function(el, editMode, eOpts) {
                    if (editMode) {
                        if (!this.textareaEl._syncInited) {
                            this.textareaEl.on('keydown', function() {
                                this.fireEvent('sync', this, this.textareaEl.getValue());
                                this.fireEvent('change', this, this.textareaEl.getValue());
                            }, this, { buffer: 50 });
                        }
                        this.textareaEl._syncInited = true;
                    }
                }


            }

        });

        Ext.tip.QuickTipManager.init();

        this.scopeTypeInput = Ext.create('Ext.form.field.ComboBox',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.general.scope', me, {
            name: 'scope',
            fieldLabel: "Applies To",
            labelAlign: 'top',
            editable: false,
            allowBlank: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            width: 295,
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["Line Item", "LineItem"],
                    ["Order", "Order"]
                ]
            }),
            listeners: {
                change: function (myself, newVal, oldVal) {
                    this.record.fireEvent( "scopeChange", myself, newVal, oldVal);
                    me.parentForm.setFieldVisibility();
                    me.filterFixedPriceOptionWhenOrderProduct(newVal, null);
                },
                scope: me
            }
            })
        );

        this.targetTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'target',
            fieldLabel: "Affects",
            labelAlign: 'top',
            editable: false,
            allowBlank: false,
            width: 295,
            margin: '0 0 0 10',
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["Product", "Product"],
                    ["Shipping", "Shipping"]
                ]
            }),
            listeners: {
                change: function (myself, newVal) {
                    this.parentForm.setFieldVisibility();
                    this.filterFixedPriceOptionWhenOrderProduct(null, newVal);
                },
                scope: this
            },
            value: "Product"
        });

        this.discountTypeData = Ext.create('Ext.data.Store', {
            autoLoad: true,
            fields: ['name', 'value'],
            data: [
                { name: "Percentage", value: "Percentage" },
                { name: "Amount", value: "Amount" },
                { name: "Free", value: "Free" },
                { name: 'Fixed Price', value: 'FixedPrice' }
            ],
            filters: [
                function (item) {
                    return (item.get('value') !== 'FixedPrice' && item.get('value') !== 'Free') ||
                        (me.record.get('scope') === 'LineItem' || me.record.get('target') === 'Shipping');
                }
            ]
        });
        
        this.amountTypeInput = Ext.create('Ext.form.field.ComboBox',
            Taco.core.ux.TooltipLabel.wrapConfig('discount.general.amountType', me, {
                name: 'amountType',
                fieldLabel: "Type",
                labelAlign: 'top',
                allowBlank: false,
                editable: false,
                forceSelection: true,
                displayField: 'name',
                valueField: 'value',
                width: 295,
                store: this.discountTypeData,
                queryMode: 'local',
                listeners: {
                    change: function (cmp, newV, oldV) {
                        this.updateAmountField();
                    },
                    scope: this
                }
            })
        );
        
        var amountFieldLabel = "";
        switch (this.record.get("amountType")) {
            case "Percentage":
                amountFieldLabel = "Percentage Off";
                break;
            case "Free":
                break;
            case "Amount":
                amountFieldLabel = "Amount Off";
                break;
            case "FixedPrice":
                amountFieldLabel = "Price";
                break;
        }

        this.amountInput = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'amount',
            allowBlank:false,
            fieldLabel: amountFieldLabel,
            minValue: 0.01,
            width: 295,
            margin: '0 0 0 10',
            forcePrecision: (this.record.get('amountType') === 'Amount'),
            unitAtEnd: this.record.get('amountType') === 'Percentage' ? true : false,
            unitString: (this.record.get('amountType') === 'Percentage') ? '%' : Taco.app.context.currencies[Taco.app.context.getCurrent().currencyCode.toLowerCase()].symbol,
            hideTrigger: true,
            disabled: (this.record.get('amountType') === 'Free') ? true : false,
            hidden: (this.record.get('amountType') === 'Free') ? true : false
        });

        this.items = [
            this.nameInput,
            this.descriptionInput, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'top'
                },
                items: [
                    this.scopeTypeInput,
                    this.targetTypeInput
                ]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'top'
                },
                width: 600,
                items: [
                    this.amountTypeInput,
                    this.amountInput
                ]
            }
        ];

        this.callParent(arguments);
    },

    updateAmountField : function() {
        var me = this,
            newValue = this.amountTypeInput.getValue(),
            amountInputLabel = "",
            amountInputVisible = true;

        function setCurrencyInput() {
            me.amountInput.unitString = Taco.app.context.currencies[Taco.app.context.getCurrent().currencyCode.toLowerCase()].symbol;
            me.amountInput.unitAtEnd = false;
        }
                        
        switch (newValue) {
            case "Percentage":
                me.amountInput.unitString = '%';
                me.amountInput.unitAtEnd = true;
                amountInputLabel = "Percentage Off";
                amountInputVisible = true;
                break;
            case "Free":
                amountInputVisible = false;
                break;
            case "Amount":
                setCurrencyInput();
                amountInputLabel = "Amount Off";
                amountInputVisible = true;
                break;
            case "FixedPrice":
                setCurrencyInput();
                amountInputLabel = "Price";
                amountInputVisible = true;
                break;
        }

        me.amountInput.setVisible(amountInputVisible);
        me.amountInput.setDisabled(!amountInputVisible);
        me.amountInput.setFieldLabel(amountInputLabel);
                        
                        
        if  (newValue == 'Free') {
            me.amountInput.setValue(null);
        } else {
            me.amountInput.setValue(this.amountInput.value);
        }

        
        me.amountInput.clearInvalid();
        // notify the parent form. limitations will need to adjust to the value;
        // see this.maxDiscountOrderValue
        this.parentForm.setFieldVisibility();  

    },

    isOrder: function () {
        return this.scopeTypeInput.getValue() === 'Order';
    },

    isLineItem: function () {
        return this.scopeTypeInput.getValue() === 'LineItem';
    },

    appliesToShipping: function () {
        return this.targetTypeInput.getValue() === 'Shipping';
    },

    filterFixedPriceOptionWhenOrderProduct: function (appliesTo, affects) {
        var isLineItem = appliesTo ? appliesTo === 'LineItem' : this.isLineItem(),
            isShipping = affects ? affects === 'Shipping' : this.appliesToShipping();
        if (isLineItem || isShipping) {
            //add fixed price
            this.amountTypeInput.store.clearFilter(false);
        } else {
            //filter fixed price.
            this.amountTypeInput.store.filterBy(function(item) {
                 return (item.get('value') !== 'FixedPrice' && item.get('value') !== 'Free');
            });

            if (this.amountTypeInput.getValue() === 'FixedPrice' || this.amountTypeInput.getValue() === 'Free') {
                this.amountTypeInput.setValue('Percentage');
                Taco.app.fireEvent('setmessage', 'The chosen discount type is not applicable to Order level discounts affecting products. Please choose another discount type.', 'warning');
            }
        }
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});