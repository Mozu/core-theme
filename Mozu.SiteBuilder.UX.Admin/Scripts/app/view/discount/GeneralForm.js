

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
                change: this.setFieldVisibility,
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
                change: this.setFieldVisibility,
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
                afterrender: this.setTypeFieldVisibility,
                change: this.onAmountTypeInputChange,
                scope: this
            }
        });

        this.amountInput = Ext.create('Taco.core.ux.form.UnitField', {
            name: 'amount',
            minValue: 0,
            width: 150,
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
    

    /*
        Sets the "Applies To" combobox to "Free Shipping" when appropriate.
    */
    onAmountTypeInputChange: function (input, value) {
        var me = this;

        if (!me.rendered) {
            //return;
        }


        // guard against this callback being called before the entire form is rendered
        if (!me.amountInput) {
            return;
        }

        //me.amountInput.hide();

        me.setTypeFieldVisibility(me.amountTypeInput);

        // calling .select() does not fire the change event, fire it manually.
        //me.targetTypeInput.fireEvent('change', me.targetTypeInput, me.targetTypeInput.getValue());
    },

    setTypeFieldVisibility: function (input) {
        var me = this,
            value = input.getValue(),
            amount = me.amountInput.getValue(); 

        if (value === 'Free') {  
            me.amountInput.hide();

            me.amountInput.setValue(0);
        } else {
            me.amountInput.show();

            if (me.targetTypeInput.getValue() === "Product") {
                me.targetTypeInput.select("AllProducts");
                me.targetTypeInput.fireEvent('change', me.targetTypeInput, me.targetTypeInput.getValue());
            }

            me.targetTypeInput.enable();

            me.amountInput.setMaxValue(value === 'Percentage' ? 100 : Number.MAX_VALUE);
            me.amountInput.unitAtEnd = (value === 'Percentage' ? true : false);
            me.amountInput.unitString = (value === 'Percentage' ? '%' : '$');
            me.amountInput.setValue(amount);
        }
    },

    setFieldVisibility: function () {
        var me = this,
            nonOrderScope = me.scopeTypeInput.getValue() != 'Order';

        me.includeAllProductsInput.setVisible(me.targetTypeInput.getValue() != 'Shipping' && nonOrderScope);
        me.shippingList.setVisible(me.targetTypeInput.getValue() == 'Shipping');
        me.categoriesBox.setVisible(!me.includeAllProductsInput.getValue() && nonOrderScope);
        me.productsBox.setVisible(!me.includeAllProductsInput.getValue() && nonOrderScope);
        me.productsExcludeBox.setVisible(!me.includeAllProductsInput.getValue() && nonOrderScope);
        me.exclueCategoriesBox.setVisible(!me.includeAllProductsInput.getValue() && nonOrderScope);
        me.minimumLifetimeValueAmount.setVisible(!nonOrderScope);
    },
});