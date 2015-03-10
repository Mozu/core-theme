/**
 * @class  Taco.view.discount.GeneralForm
 * @author Travis Johnson
 * @description Dicounts General Form
 */
Ext.define('Taco.view.discount.GeneralForm', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-discount-general',
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

        this.scopeTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'scope',
            fieldLabel: "Discount Applies To",
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
                    ["LineItem", "LineItem"],
                    ["Order", "Order"]
                ]
            }),
            listeners: {
                change: function (myself, newVal) {
                    this.parentForm.setFieldVisibility();
                    this.filterFixedPriceOptionWhenOrderProduct(newVal, null);
                },
                scope: this
            }
        });

        this.targetTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'target',
            fieldLabel: "Discount Affects",
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

        this.amountTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'amountType',
            fieldLabel: "Discount Type",
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
                change: function (me, newV, oldV) {
                    if (newV == 'Percentage') {
                        this.amountInput.unitString = '%';
                        this.amountInput.unitAtEnd = true;
                    } else if (newV == 'Free') {
                        this.amountInput.setDisabled(true);
                        this.amountInput.setValue(null);
                        this.parentForm.setFieldVisibility();
                        return;
                    } else {
                        this.amountInput.unitString = Taco.app.context.currencies[Taco.app.context.getCurrent().currencyCode.toLowerCase()].symbol;
                        this.amountInput.unitAtEnd = false;
                    }
                    this.amountInput.setDisabled(false);
                    this.amountInput.setValue(this.amountInput.value);

                    // notify the parent form. limitations will need to adjust to the value;
                    // see this.maxDiscountOrderValue
                    this.parentForm.setFieldVisibility();
                },
                scope: this
            }
        });

        this.amountInput = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'amount',
            fieldLabel: 'Amount',
            minValue: 0,
            width: 295,
            margin: '0 0 0 10',
            forcePrecision: (this.record.get('amountType') === 'Amount'),
            unitAtEnd: this.record.get('amountType') === 'Percentage' ? true : false,
            unitString: (this.record.get('amountType') === 'Percentage') ? '%' : Taco.app.context.currencies[Taco.app.context.getCurrent().currencyCode.toLowerCase()].symbol,
            hideTrigger: true,
            disabled: (this.record.get('amountType') === 'Free') ? true : false,
            labelStyle: 'visibility: hidden'
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