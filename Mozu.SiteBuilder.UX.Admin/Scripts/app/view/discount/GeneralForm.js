

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
                change: function () {
                    this.parentForm.setFieldVisibility();
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
                change: function () {
                    this.parentForm.setFieldVisibility();
                },
                scope: this
            },
            value: "Product"
        });

        this.amountTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'amountType',
            fieldLabel: "Discount Type",
            labelAlign: 'top',
            allowBlank: false,
            editable: false,
            forceSelection: true,
            displayField: 'text',
            valueField: 'value',
            flex: 1,
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ["Percentage", "Percentage"],
                    ["Dollar Amount", "Amount"],
                    ["Free", "Free"],
                    ["Fixed Price", "FixedPrice"]
                ]
            }),
            listeners: {
                change: function (me, newV, oldV) {
                    if (newV == 'Percentage') {
                        this.amountInput.unitString = '%';
                        this.amountInput.unitAtEnd = true;
                    } else if (newV == 'Free') {
                        this.amountInput.setDisabled(true);
                        this.amountInput.setValue(null);
                        return;
                    } else {
                        this.amountInput.unitString = Taco.app.context.currencies[Taco.app.context.getCurrent().currencyCode.toLowerCase()].symbol;
                        this.amountInput.unitAtEnd = false;
                    }
                    this.amountInput.setDisabled(false);
                    this.amountInput.setValue(this.amountInput.value);
                },
                scope: this
            }
        });

        this.amountInput = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'amount',
            fieldLabel: 'Amount',
            minValue: 0,
            width: 150,
            forcePrecision:(this.record.get('amountType') === 'Amount'),
            margin: '0 0 0 10',
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

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});