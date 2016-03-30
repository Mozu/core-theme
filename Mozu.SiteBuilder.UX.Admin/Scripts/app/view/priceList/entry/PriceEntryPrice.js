/**
 * @class  Taco.view.priceList.entry.PriceEntryPrice
 * @description Price List PriceEntryPrice Form
 */
Ext.define('Taco.view.priceList.entry.PriceEntryPrice', {
    extend: 'Taco.core.ux.form.Form',
    alias: 'widget.taco-priceList-price-entry-price',
    requires: [
        'Ext.form.field.ComboBox',
        'Taco.model.PriceListEntryPrice',
        'Taco.core.ux.form.CurrencyField',
        'Ext.form.field.Date',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.priceList.widget.PriceListComboBox',
        'Taco.core.ux.picker.CheckboxTreeModal',
        'Taco.view.priceList.widget.OverrideField',
        'Taco.view.product.widget.ProductBundleGrid'
    ],
    ui: 'subform',
    margin: '0 0 20 0',

    title: 'Adjustments',
    record: null,
    currencyCode: null,
    bubbleEvents: ['save'],

    initComponent: function() {
        var me = this;

        Ext.tip.QuickTipManager.init();

        me.basicPanel = Ext.create('Ext.panel.Panel', {
            title: 'Basic',
            itemId: 'basicPanel',
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
            items: []
        });

        var entries = this.record.get('priceEntries');

        if (entries.length === 0) {
            entries.push({
                minQty: 1
            });
        }

        Ext.Array.each(entries, function(entry, index, entries) {
            
            var row = {};

            row.minQty = Ext.widget('numberfield', {
                fieldLabel: 'Minimum Quantity',
                name: 'minQty',
                hideTrigger: true,
                value: entry.minQty,
                margin: '0 20 0 0',
                hidden: true
            });

            row.priceOverride = Ext.widget('overridefield', {
                checkboxCfg: {
                    checked: entry.listPriceMode === 'Overridden',
                    onChange: function(newVal, oldVal) {
                        var isOverridden = newVal === 'Overridden';
                        if (isOverridden && row.salePriceOverride) {
                            row.salePriceOverride.override.setValue(true);
                        }
                        if (row.priceOverride) {
                            Ext.apply(row.priceOverride.overrideField, { allowBlank: !isOverridden});
                            row.priceOverride.overrideField.validate();
                        }
                        
                    }
                },
                fieldCfg: {
                    name: 'listPrice',
                    itemId: 'priceField',
                    fieldLabel: 'Price',
                    currencyCode: me.currencyCode,
                    value: entry.listPrice,
                    allowBlank: entry.listPriceMode !== 'Overridden'
                }
            });

            row.priceOverride.overrideField.validate();

            row.salePriceOverride = Ext.widget('overridefield', {
                checkboxCfg: {
                    checked: entry.salePriceMode === 'Overridden',
                    onChange: function(newVal, oldVal) {
                        if (newVal === 'UseCatalog' && row.priceOverride) {
                            row.priceOverride.override.setValue(false);
                        }
                    }
                },
                fieldCfg: {
                    name: 'salePrice',
                    itemId: 'salePriceField',
                    fieldLabel: 'Sale Price',
                    currencyCode: me.currencyCode,
                    value: entry.salePrice
                }
            });

            var rowForm = {
                xtype: 'form',
                layout: {
                    type: 'hbox',
                    align: 'top'
                },
                record: Ext.create('Taco.model.PriceListEntryPrice', entry),
                defaults: {
                    flex: 1
                },
                items: [
                    row.minQty,
                    row.priceOverride,
                    row.salePriceOverride
                ]
            };

            me.basicPanel.add(rowForm);

        });

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
                name: 'cost',
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
            name: 'mapStartDate',
            emptyText: 'Default',
            listeners: {
                afterRender: function() {
                    this.disabled = !me.mapOverride.isOverridden();
                },
                scope: me.mapStartDate
            }
        });

        me.mapEndDate = Ext.create('Taco.core.ux.form.DateTime', {
            minValue: new Date(),
            fieldLabel: 'MAP End Date',
            name: 'mapEndDate',
            emptyText: 'Default',
            listeners: {
                afterRender: function() {
                    this.disabled = !me.mapOverride.isOverridden();
                },
                scope: me.mapEndDate
            }
        });

        me.discountRestriction = Ext.widget('combobox', {
            fieldLabel: 'Discounts Restriction',
            name: 'discountsRestricted',
            displayFeild: 'text',
            valueField: 'value',
            editable: false,
            forceSelection: true,
            queryMode: 'local',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: ['text', 'value'],
                data: [
                    ['Default', null],
                    ['On', true],
                    ['Off', false]
                ]
            }),
            listeners: {
                scope: me,
                afterrender: function() {
                    if (this.record.phantom || this.record.get('discountsRestricted') == null) {
                        this.discountRestriction.setValue(this.discountRestriction.getStore().getAt(0));
                    }
                },
                change: function(cmp, newVal) {
                    if (newVal === true) {
                        this.restrictionStartDate.enable();
                        this.restrictionEndDate.enable();
                    }
                    else {
                        this.restrictionStartDate.disable();
                        this.restrictionStartDate.setValue(null);
                        this.restrictionEndDate.disable();
                        this.restrictionEndDate.setValue(null);
                    }
                }
            }
        });

        me.restrictionStartDate = Ext.create('Taco.core.ux.form.DateTime', {
            minValue: new Date(),
            fieldLabel: 'Restriction Start Date',
            name: 'discountsRestrictedStartDate',
            emptyText: 'Default',
            disabled: this.record.phantom || this.record.get('discountsRestricted') == null,
            listeners: {
                afterRender: function() {
                    this.disabled = me.discountRestriction.getValue() !== 'On';
                },
                scope: me.restrictionStartDate
            }
        });

        me.restrictionEndDate = Ext.create('Taco.core.ux.form.DateTime', {
            minValue: new Date(),
            fieldLabel: 'Restriction End Date',
            name: 'discountsRestrictedEndDate',
            emptyText: 'Default',
            disabled: this.record.phantom || this.record.get('discountsRestricted') == null,
            listeners: {
                afterRender: function() {
                    this.disabled = me.discountRestriction.getValue() !== 'On';
                },
                scope: me.restrictionEndDate
            }
        });

        me.mapRow = Ext.widget('panel', {
            flex: 1,
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'top'
            },
            hidden: me.record.get('isVariation'),
            defaults: {
                flex: 1
            },
            items: [
                me.mapOverride,
                me.mapStartDate,
                me.mapEndDate
            ]
        });

        me.discountRestrictionRow = Ext.widget('panel', {
            flex: 1,
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'top'
            },
            hidden: me.record.get('isVariation'),
            defaults: {
                flex: 1
            },
            items: [
                me.discountRestriction,
                me.restrictionStartDate,
                me.restrictionEndDate
            ]
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
                me.mapRow,
                me.discountRestrictionRow
            ]
        };

        me.extrasGrid = Ext.create('Taco.view.priceList.entry.ExtrasGrid', {});
        
        me.extrasPanel = Ext.create('Ext.panel.Panel', {
            title: 'Extras',
            itemId: 'extrasPanel',
            layout: 'fit',
            padding: '20',
            items: [me.extrasGrid]
        });

        me.tabs = Ext.create('Ext.tab.Panel', {
            width: "100%",
            minHeight: 475,
            style: {
                borderColor: '#cccccc'
            },
            items: [
                me.basicPanel, //move to subform file?
                me.advancedPanel,
                me.extrasPanel
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