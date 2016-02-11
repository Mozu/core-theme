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
        //'Taco.view.priceList.widget.OverrideField',
        'Ext.form.field.Date',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.priceList.widget.PriceListComboBox',
        'Taco.core.ux.picker.CheckboxTreeModal'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Price',
    record: null,
    currencyCode: null,

    initComponent: function() {
        var me = this;

        Ext.tip.QuickTipManager.init();





        this.priceField = Ext.widget('currencyfield', {
            name: 'price',
            itemId: 'priceField',
            fieldLabel: 'Price',
            currencyCode: me.currencyCode,
            allowBlank: true,
            hideTrigger: true,
            margin: '0 30 0 0',
            flex: 9,
            required: false,
            fieldStyle: 'text-align:right',
            listeners: {
                change: function (cmp, newVal, oldVal, eOpts) {
                    if (newVal && !oldVal) {
                        this.priceFieldOverride.setValue(true);
                    }
                },
                scope: this
            }
        });

        this.priceFieldOverride = Ext.widget('checkbox', {
            margin: '0 30 0 0',
            listeners: {
                change: function(cmp, newVal, oldVal) {
                    if (oldVal && !newVal) {
                        me.priceField.setValue(null);
                    }
                },
                scope: me
            }
        });

        this.enabledPrice = {
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '50%',
            items: [
                this.priceFieldOverride,
                this.priceField
            ]
        };

        this.salePriceFieldOverride = Ext.widget('checkbox', {
            //flex: 1,
            margin: '0 30 0 0',
            listeners: {
                change: function(cmp, newVal, oldVal) {
                    if (oldVal && !newVal) {
                        me.salePriceField.setValue(null);
                    }
                },
                scope: me
            }
        });


        this.salePriceField = Ext.widget('currencyfield', {
            name: 'salePrice',
            itemId: 'salePriceField',
            fieldLabel: 'Sale Price',
            currencyCode: me.currencyCode,
            allowBlank: true,
            hideTrigger: true,
            margin: '0 30 0 0',
            flex: 9,
            required: false,
            fieldStyle: 'text-align:right',
            listeners: {
                change: function (cmp, newVal, oldVal, eOpts) {
                    if (newVal && !oldVal) {
                        this.salePriceFieldOverride.setValue(true);
                    }
                },
                scope: this
            }
        });

        this.enabledSalePrice = {
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '50%',
            items: [
                this.salePriceFieldOverride,
                this.salePriceField
            ]
        };

        this.basicPanel = {
            xtype: 'panel',
            title: 'Basic',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            width: '50%',
            padding: '0 19 19 19',
            items: [
                {
                    xtype: 'panel',
                    layout: {
                        type: 'hbox',
                        align: 'bottom'
                    },
                    width: '50%',
                    items: [
                        this.enabledPrice,
                        this.enabledSalePrice
                    ]
                }
            ]
        };

        this.advancedPanel = {
            xtype: 'panel',
            title: 'Advanced',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            width: '50%',
            padding: '0 19 19 19',
            items: [
                {
                    xtype: 'panel',
                    layout: {
                        type: 'hbox',
                        align: 'bottom'
                    },
                    width: '50%',
                    items: [
                        {
                            xtype: 'currencyfield',
                            name: 'price',
                            itemId: 'priceField',
                            fieldLabel: 'Price',
                            currencyCode: me.currencyCode,
                            allowBlank: true,
                            hideTrigger: true,
                            margin: '0 30 0 0',
                            width: '50%',
                            required: false
                        },
                        {
                            xtype: 'currencyfield',
                            name: 'salePrice',
                            itemId: 'salePriceField',
                            fieldLabel: 'Sale Price',
                            allowBlank: true,
                            hideTrigger: true,
                            margin: '0 30 0 0',
                            width: '50%'
                        }
                    ]
                }
            ]
        };

        this.tabs = Ext.create('Ext.tab.Panel', {
            width: "100%",
            minHeight: 475,
            style: {
                borderColor: '#cccccc'
            },
            items: [
                this.basicPanel, //move to subform file?
                this.advancedPanel
            ]
        });

        this.items = [
            this.tabs
        ];

        this.callParent(arguments);
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