/**
 * @class Taco.view.product.subform.Inventory
 */

Ext.define('Taco.view.product.subform.Options', {
    extend: 'Taco.view.product.subform.Subform',
    alias: 'widget.taco-product-options',

    requires: ['Taco.view.product.variant.Modal',
        'Taco.view.product.variant.Grid',
        'Taco.view.product.variant.Options'],

    title: 'Options',
    pricingModeChanged: false,

    cls: "taco-product-subform-option",

    initComponent: function () {

        var me = this;

        this.record = this.product;

        this.pricingMode = Ext.widget('combobox', {
            xtype: 'combobox',
            name: 'variationPricingMethod',
            labelAlign: 'left',
            fieldLabel: 'Pricing Mode',
            forceSelection: true,
            editable: false,
            autoSelect: true,
            displayField: 'text',
            originalValue: this.record.get('variationPricingMethod'),
            valueField: 'value',
            store: Ext.create('Ext.data.Store', {
                fields: ['text', 'value'],
                data: [
                    { 'text': 'Relative', 'value': 'Delta' },
                    { 'text': 'Explicit', 'value': 'Fixed' }
                ]
            }),
            listeners: {
                change: {
                    fn: function (cmp, newVal) {
                        this.pricingModeChanged = (newVal != cmp.originalValue);
                    },
                    scope: this
                }
            }
        });

        var activeOption = function () {
            if (me.record.get('slicingAttributeFQN')) {
                return me.record.get('options').find(function (option) {
                    return option.attributeFQN === me.record.get('slicingAttributeFQN');
                });
            }
        }

        var initActiveOption = activeOption();

        this.slicingOptionSelect = Ext.widget({
            xtype: 'selectfield',
            fieldLabel: 'Selected option',
            allowBlank: true,
            margin: '20 0 0 15',
            queryMode: 'local',
            store: this.product.getOptions(),
            displayField: 'name',
            valueField: 'attributeFQN',
            name: 'productTypeOption',
            itemId: 'product-type-option',
            hidden: initActiveOption === undefined,
            disabled: !this.isGlobal,
            value: (initActiveOption) ? initActiveOption.attributeFQN : null,
            listeners: {

                beforeselect: function (combo, record, index, eOpts) {
                    var me = this;
                    var value = record.get('attributeFQN');
                    var store = me.product.getOptions();
                    combo.setValue(value);
                    return true;
                },
                change: function (field, newvalue) {
                   
                    me.record.set('slicingAttributeFQN',newvalue);
                },

                scope: this
            }
        });

        this.slicingCheckbox = Ext.create('Ext.form.field.Checkbox', {
            itemId: 'slicing-checkbox',
            margin: '0 0 0 15',
            boxLabel: 'Allow Product Slicing',
            disabled: !this.isGlobal,
            value: ((initActiveOption) ? initActiveOption.attributeFQN : null) != null,
            handler: function () {
                var self = this;
                me.slicingOptionSelect.setVisible(self.checked);

                if (!self.checked) {
                    me.slicingOptionSelect.setValue(null);
                }

            },

            tooltip: Ext.create('Taco.core.ux.content.Tooltip', {
                elementId: 'slicing-checkbox',
                messageKey: 'product.images.productSlicing',
                hoverTarget: 'boxLabelEl',
                offsetTop: 35,
                offsetLeft: -195,
                arrowPosition: 'left'
            })
        });



        this.items = [{
            xtype: 'component',
            flex: 1,
            itemId: 'list',
            html: ''
        }, this.pricingMode, {
            xtype: 'button',
            text: 'Select Values',
            scale: 'medium',
            ui: 'action',
            width: 150,

            handler: function () {
                //if (this.product.phantom) {
                //    Taco.MessageBox.alert(
                //        'Sorry!',
                //        'You must first finish and save the Product before assigning option values.'
                //    );
                //    return;
                //}
                this.editVariants()
            },
            scope: this
        },
        {
            xtype: 'component',
            itemId: 'slicing-title',
            html: '<p>Slicing<p>',
            margin: '40 0 25 0'
        },
        this.slicingCheckbox,
        this.slicingOptionSelect
        ];
        this.callParent(arguments);

        this.list = this.down('#list');
        this.loadByProductTypeId();
    },

    onVariantChange: function (view, variantData, optionData) {
        var me = this;

        // update the local option data

        // update the local variant data;
        this.list.update(this.buildOptionsHtml());


    },

    // get data from optionsStore
    getOptionsData: function () {
        var data = [];
        this.product.getOptions().each(function (item) {
            data.push(Ext.clone(item.data))
        }, this);

        return data;
    },
    // get the unpersisted data from the variations store;
    getVariationsData: function () {
        var data = [];
        this.product.getVariations().each(function (item) {
            data.push(Ext.clone(item.data))
        }, this);

        return data;
    },

    editVariants: function () {
        var me = this;

        Ext.create('Taco.view.product.variant.Modal', {
            product: this.product,
            productType: this.productType,
            pricingMode: this.pricingMode.getValue(),
            pricingModeChanged: me.pricingModeChanged,
            listeners: {
                aftersaveclose: this.onVariantChange,
                close: function () {

                    //this.product.getVariations().whenLoaded(this.rebuild, this);
                },
                scope: this
            }
        });
    },

    buildOptionsHtml: function () {
        var ret = [];

        if (!this.productType) return '';

        this.product.getOptions().each(function (option) {
            var attribute;

            if (!option.get('values').length) return;

            attribute = this.findAttribute(option);

            if (!attribute) {
                console.log('Failed to find Attribute for option: ', option);
                return;
            }

            ret.push("<div class='option-item' style='padding-bottom:10px;'>");
            ret.push(attribute.get('adminName') + ' - ');

            Ext.each(option.get('values'), function (val, i) {
                var value = Ext.Array.findBy(attribute.get('selectedValues'), function (item) {
                    return typeof item.id !== 'undefined' && (item.id.toString() === val.toString());
                });

                if (!value) return;

                if (i > 0) ret.push(', ');

                ret.push(value.value);
            }, this);

            ret.push("</div>");

        }, this);

        return ret.join('');
    },

    findAttribute: function (record) {
        return this.productType.getOptions().findRecord('attributeFQN', record.get('attributeFQN'), 0, false, false, true);
    },

    loadByProductTypeId: function (value) {
        var productTypeId = typeof value === 'number' ? value : this.product.get('productTypeId');

        this.productType = this.product.productTypeRecord;
        this.rebuild();
    },

    rebuild: function () {
        this.list.update(this.buildOptionsHtml());
    }
});