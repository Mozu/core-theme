/**
 * @class  Taco.view.priceList.entry.PriceEntryPrice
 * @description Price List PriceEntryPrice Form
 */
Ext.define('Taco.view.priceList.entry.PriceEntryPrice', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-price-entry-price',
    requires: [
        'Ext.form.field.ComboBox',
        'Taco.core.ux.form.CurrencyField',
        'Ext.form.field.Date',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.priceList.widget.PriceListComboBox',
        'Taco.core.ux.picker.CheckboxTreeModal',
        'Taco.view.priceList.widget.OverrideField'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Price',
    record: null,
    currencyCode: null,

    initComponent: function() {
        var me = this;

        Ext.tip.QuickTipManager.init();

        this.priceOverride = Ext.widget('overridefield', {
            fieldCfg: {
                name: 'price',
                itemId: 'priceField',
                fieldLabel: 'Price',
                currencyCode: me.currencyCode
            },
            requireOverrideValue: true
        });;

        me.salePriceOverride = Ext.widget('overridefield', {
            fieldCfg: {
                name: 'salePrice',
                itemId: 'salePriceField',
                fieldLabel: 'Sale Price',
                currencyCode: me.currencyCode,
            }
        });

        me.basicPanel = {
            xtype: 'panel',
            title: 'Basic',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            width: '50%',
            padding: '20',
            defaults: {
                flex: 1,
                defaults: {
                    flex: 1
                }
            },
            items: [
                {
                    xtype: 'panel',
                    layout: {
                        type: 'hbox',
                        align: 'top'
                    },
                    width: '50%',
                    items: [
                        me.priceOverride,
                        me.salePriceOverride
                    ]
                }
            ]
        };

        me.msrpOverride = Ext.widget('overridefield', {
            fieldCfg: {
                name: 'msrp',
                itemId: 'msrpPriceField',
                fieldLabel: 'MSRP',
                currencyCode: me.currencyCode
            }
        });
        
        me.costOverride = Ext.widget('overridefield', {
            fieldCfg: {
                name: 'costPrice',
                itemId: 'costPriceField',
                fieldLabel: 'Cost',
                currencyCode: me.currencyCode
            }
        });

        me.mapOverride = Ext.widget('overridefield', {
            fieldCfg: {
                name: 'map',
                itemId: 'MAPField',
                fieldLabel: 'MAP',
                currencyCode: me.currencyCode,
                onChange: function(newVal, oldVal) {
                    if (newVal) {
                        me.mapStartDate.enable();
                        me.mapEndDate.enable();
                    }
                    else {
                        me.mapStartDate.disable();
                        me.mapStartDate.setValue(null);
                        me.mapEndDate.disable();
                        me.mapEndDate.setValue(null);
                    }
                }
            }
        });

        me.mapStartDate = Ext.create('Taco.core.ux.form.DateTime', {
            minValue: new Date(),
            fieldLabel: 'MAP Start Date',
            name: 'MAPStartDate',
            disabled: !me.mapOverride.isOverridden(),
            emptyText: 'Default'
        });

        me.mapEndDate = Ext.create('Taco.core.ux.form.DateTime', {
            minValue: new Date(),
            fieldLabel: 'MAP End Date',
            name: 'MAPEndDate',
            disabled: !me.mapOverride.isOverridden(),
            emptyText: 'Default'
        });

        me.discountRestriction = Ext.widget('selectfield', {
            fieldLabel: 'Discounts Restriction',
            name: 'discountsRestricted',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ['Default', null],
                    ['On', true],
                    ['Off', false]
                ]
            }),
            onChange: function(newVal, oldVal) {
                if (newVal === 'On') {
                    me.restrictionStartDate.enable();
                    me.restrictionEndDate.enable();
                }
                else {
                    me.restrictionStartDate.disable();
                    me.restrictionStartDate.setValue(null);
                    me.restrictionEndDate.disable();
                    me.restrictionEndDate.setValue(null);
                }
            }
        });

        me.restrictionStartDate = Ext.create('Taco.core.ux.form.DateTime', {
            minValue: new Date(),
            fieldLabel: 'Restriction Start Date',
            name: 'discountsRestrictedStartDate',
            disabled: me.discountRestriction.getValue() !== 'On',
            emptyText: 'Default'
        });

        me.restrictionEndDate = Ext.create('Taco.core.ux.form.DateTime', {
            minValue: new Date(),
            fieldLabel: 'Restriction End Date',
            name: 'discountsRestrictedEndDate',
            disabled: me.discountRestriction.getValue() !== 'On',
            emptyText: 'Default'
        });

        me.advancedPanel = {
            xtype: 'panel',
            title: 'Advanced',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            width: '50%',
            padding: '20',
            defaults: {
                flex: 1,
                xtype: 'panel',
                layout: {
                    type: 'hbox',
                    align: 'top'
                },
                defaults: {
                    flex: 1
                }
            },
            items: [
                {
                    items: [
                        me.msrpOverride,
                        me.costOverride,
                        {}
                    ]
                },
                {
                    items: [
                        me.mapOverride,
                        me.mapStartDate,
                        me.mapEndDate
                    ]
                },
                {
                    items: [
                        me.discountRestriction,
                        me.restrictionStartDate,
                        me.restrictionEndDate
                    ]
                }
            ]
        };

        me.tabs = Ext.create('Ext.tab.Panel', {
            width: "100%",
            minHeight: 475,
            style: {
                borderColor: '#cccccc'
            },
            items: [
                me.basicPanel, //move to subform file?
                me.advancedPanel
            ]
        });

        me.items = [
            me.tabs
        ];

        me.callParent(arguments);
    },

    // after product is selected in the productPickerfield but before the combo is closed;
    onBeforeProductSelect: function (combo, record, index, e) {
        var me = this,
            productPickerField = combo,
            productCode = record.get('productCode'),
            isConfigurable = record.get('isConfigurable'),
            price,
            win,
            productCodeToAdd;


        combo.collapse();

        // determine if we need to show the configurator
        //if (isConfigurable) {
        //
        //
        //
        //    win = Ext.create('Taco.view.order.modal.ProductConfigurator', {
        //        productCode: productCode,
        //        listeners: {
        //            'aftersaveclose': {
        //                fn: function (cmp, configurationData) {
        //                    combo.inputMask.show(record.get('productName'));
        //                    //combo.showInputMask(record.get('productName'));
        //                    this.onProductSelect(record, Ext.clone(configurationData));
        //                },
        //                scope:this
        //            },
        //            'afterclose': {
        //                fn: function () {
        //                    //user cancelled the product configurator; Pass focus back to the product picker field
        //
        //                    me.productPickerField.focus();
        //
        //
        //                },
        //                scope: this
        //            }
        //        }
        //    });
        //
        //} else {
            combo.inputMask.show(record.get('productName'));
            //this.onProductSelect(record);
        //}

        // cancel the selection so that the same product can be reselected again;
        return false;
    },

    // after a product is selected and optionaly configured (if product is configurable)
    //onProductSelect : function (record,productConfig){
    //    var me = this,
    //        productCode = record.get('productCode'),
    //        variationProductCode = (productConfig && productConfig.VariationProductCode) ? productConfig.VariationProductCode : '',
    //        productCodeToAdd = variationProductCode || productCode,
    //        price;
    //
    //
    //    // if the product is configurable we need to use that configuration and extract the varient's product code
    //    if (productConfig) {
    //        //productCodeToAdd = productConfig.VariationProductCode || record.get('productCode');
    //        price = productConfig.Price || productConfig.price;
    //        if (Ext.isObject(price)) {
    //            price = price.SalePrice || price.Price;
    //        }
    //    } else {
    //        price = record.get('salePrice') || record.get('price');
    //        // need to create a product config since one wasn't passed in;
    //        productConfig = {
    //            productCode: productCode
    //        };
    //    }
    //
    //    me.codeField.setValue(productCodeToAdd);
    //    me.quantityField.setValue(1);
    //    me.quantityField.enable();
    //    me.priceField.setValue(price);
    //    // cache the config object we will use to persist this new record;
    //    me.setProductConfiguration(productConfig);
    //    // need to manually blur this field;
    //    me.productPickerField.blur();
    //    me.productPickerField.triggerBlur();
    //
    //    //init the fulfillment field. Need to pick the fulfillment location and determined product availability;
    //    this.loadFulfillmentPickerField({
    //        productCode : productCode,
    //        variationProductCode : variationProductCode
    //    });
    //},

    beforeSave: function () {
        Ext.Object.merge(this.record.data, this.form.getValues());
        return true;
    },

    onDestroy: function () {
        var me = this;

        me.clearListeners();

        this.callParent(arguments);
    }
});