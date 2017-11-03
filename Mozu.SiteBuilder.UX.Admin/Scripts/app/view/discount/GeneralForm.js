/**
 * @class  Taco.view.discount.GeneralForm
 * @author Travis Johnson
 * @description Dicounts General Form
 */
Ext.define('Taco.view.discount.GeneralForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-general',
    require: [
        'Taco.core.ux.content.Tooltip'
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
            width: 712,
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

        this.scopeTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'scope',
            fieldLabel: "Applies To",
            labelAlign: 'top',
            editable: false,
            allowBlank: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            itemId: 'appliesToField',
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
                    me.parentForm.updateApplyTo(newVal);
                    me.filterFixedPriceOptionWhenOrderProduct(newVal, null);
                },
                scope: me
            },
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'appliesToField',
                messageKey: 'discount.general.scope',
                offsetLeft: -96,
                arrowPosition: 'left'
            })
        });

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
                    me.parentForm.setFieldVisibility();
                    me.parentForm.updateApplyTo(newVal);
                    me.filterFixedPriceOptionWhenOrderProduct(null, newVal);
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
                { name: 'Fixed Price', value: 'FixedPrice' },
                { name: 'Auto Add Free Product', value: 'FreeAutoAdd' }
            ],
            filters: [
                function (item) {
                    if (item.get('value') === 'FreeAutoAdd') {
                        return me.record.get('scope') === 'LineItem' && me.record.get('target') === 'Product';
                    }

                    if (item.get('value') === 'Amount' || item.get('value') === 'Percentage') {
                        return true;
                    }

                    return (me.record.get('scope') === 'LineItem' || me.record.get('target') === 'Shipping');
                }
            ]
        });

        this.amountTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'amountType',
            itemId: 'amountType',
            fieldLabel: "Type",
            labelAlign: 'top',
            allowBlank: false,
            editable: false,
            forceSelection: true,
            displayField: 'name',
            valueField: 'value',
            emptyText: null,
            width: 295,
            store: this.discountTypeData,
            queryMode: 'local',
            listeners: {
                change: function (cmp, newV, oldV) {
                    this.updateAmountField();
                },
                scope: this
            },
            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'amountType',
                messageKey: 'discount.general.amountType',
                offsetLeft: -67,
                arrowPosition: 'left'
            })
        });

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
            disabled: (this.record.get('amountType') === 'Free' || this.record.get('amountType') === 'FreeAutoAdd') ? true : false,
            hidden: (this.record.get('amountType') === 'Free' || this.record.get('amountType') === 'FreeAutoAdd') ? true : false
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
            case "FreeAutoAdd":
                amountInputVisible = false;
                break;
        }

        me.amountInput.setVisible(amountInputVisible);
        me.amountInput.setFieldLabel(amountInputLabel);
        me.amountInput.setAllowBlank(!amountInputVisible);
        me.amountInput.setDisabled(!amountInputVisible);
        me.amountInput.validate();
        var newAmountValue = amountInputVisible ? this.amountInput.value : null;
        me.amountInput.setValue(newAmountValue);

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

    appliesToProduct: function() {
        return this.targetTypeInput.getValue() === 'Product';
    },

    filterDiscountType: function (item) {
        if (item.get('value') === 'FreeAutoAdd') {
            return this.isLineItem() && this.appliesToProduct();
        }

        if (item.get('value') === 'Amount' || item.get('value') === 'Percentage') {
            return true;
        }

        return (this.isLineItem() || this.appliesToShipping());
    },
    filterFixedPriceOptionWhenOrderProduct: function (appliesTo, affects) {
        var me = this;

        var isLineItem = appliesTo ? appliesTo === 'LineItem' : this.isLineItem(),
            isShipping = affects ? affects === 'Shipping' : this.appliesToShipping(),
            isProduct = affects ? affects === 'Product' : this.appliesToProduct();

        if (!this.appliesToProduct() || !this.isLineItem()) {
            if (this.amountTypeInput.getValue() === 'FreeAutoAdd') {
                this.amountTypeInput.setValue('Amount');
            }
        }

        if (isLineItem && isProduct) {
            this.amountTypeInput.store.clearFilter(false);
        } else if (isLineItem || isShipping) {
            // add fixed price
            this.amountTypeInput.store.clearFilter();
            this.amountTypeInput.store.addFilter(this.filterDiscountType.bind(this));
        } else {
            //filter fixed price.
            this.amountTypeInput.store.filterBy(function(item) {
                var val = item.get('value');
                return (val !== 'FreeAutoAdd' && val !== 'FixedPrice' && val !== 'Free');
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