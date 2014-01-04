

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

    initComponent: function () {

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

        this.scopeTypeInput = Ext.create('Ext.form.field.ComboBox', {
            name: 'scope',
            fieldLabel: "Discount Scope",
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
            fieldLabel: "Applies to",
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
            fieldLabel: "Type",
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
                    ["Free", "Free"]
                ]
            }),
            listeners: {
                change: function (me, newV, oldV) {
                    if (newV == 'Percentage') {
                        this.amountInput.unitString = '%';
                        this.amountInput.unitAtEnd = true;
                    } else {
                        this.amountInput.unitString = '$';
                        this.amountInput.unitAtEnd = false;
                    }
                    this.amountInput.setValue(this.amountInput.value);
                },
                scope: this
            }
        });

        this.amountInput = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'amount',
            minValue: 0,
            width: 150,
            forcePrecision:(this.record.get('amountType') === 'Amount'),
            margin: '0 0 0 10',
            unitAtEnd: this.record.get('amountType') === 'Amount' ? false : true,
            unitString: this.record.get('amountType') === 'Amount' ? '$' : '%',
            hideTrigger: true
        });

        this.items = [
            this.nameInput, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
                },
                items: [
                    this.scopeTypeInput,
                    this.targetTypeInput
                ]
            }, {
                xtype: 'container',
                layout: {
                    type: 'hbox',
                    align: 'bottom'
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
    
    isLineItem: function () {
        return this.scopeTypeInput.getValue() === 'LineItem';
    },

    appliesToShipping: function () {
        return this.targetTypeInput.getValue() === 'Shipping';
        }
});