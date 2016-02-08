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
        var me = this,
            mc = Taco.app.context.getMasterCatalog(),
            defaultCurrency = mc.currencyCode;

        Ext.tip.QuickTipManager.init();

        var currencyData = Ext.Array.map(mc.catalogs, function (catalog) {
            return {
                id: catalog.currencyCode,
                name: catalog.currencyCode
            };
        });

        var currencyStore = Ext.create('Ext.data.Store', {
            fields: ['id','name'],
            data: currencyData
        });

        //this.salePriceOverrideField = Ext.widget('taco-override-field', {
        //    fieldName: 'salePrice',
        //    fieldLabel: 'Sale Price',
        //    enabledFieldName: 'isSalePriceEnabled',
        //    currencyCode: me.currencyCode,
        //    record: me.record
        //});

        this.priceField = Ext.widget('currencyfield', {
            name: 'price',
            itemId: 'priceField',
            fieldLabel: 'Price',
            currencyCode: me.currencyCode ? me.currencyCode : defaultCurrency,
            allowBlank: true,
            hideTrigger: true,
            margin: '0 30 0 0',
            flex: 9,
            required: false,
            disabled: true,
            fieldStyle: 'text-align:right'
        });

        this.enabledPrice = {
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '50%',
            items: [
                this.priceField,
                {
                    xtype: 'checkbox',
                    flex: 1,
                    listeners: {
                        change: function(cmp, newVal) {
                            me.priceField.setDisabled(!newVal);
                        },
                        scope: me
                    }

                }
            ]
        };


        this.salePriceField = Ext.widget('currencyfield', {
            name: 'salePrice',
            itemId: 'salePriceField',
            fieldLabel: 'Sale Price',
            currencyCode: me.currencyCode ? me.currencyCode : defaultCurrency,
            allowBlank: true,
            hideTrigger: true,
            margin: '0 30 0 0',
            flex: 9,
            required: false,
            disabled: true,
            fieldStyle: 'text-align:right'
        });

        this.enabledSalePrice = {
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'bottom'
            },
            width: '50%',
            items: [
                this.salePriceField,
                {
                    xtype: 'checkbox',
                    flex: 1,
                    listeners: {
                        change: function(cmp, newVal) {
                            me.salePriceField.setDisabled(!newVal);
                        },
                        scope: me
                    }

                }
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
                        //{
                        //    xtype: 'currencyfield',
                        //    name: 'price',
                        //    itemId: 'priceField',
                        //    fieldLabel: 'Price',
                        //    currencyCode: me.currencyCode,
                        //    allowBlank: true,
                        //    hideTrigger: true,
                        //    margin: '0 30 0 0',
                        //    width: '50%',
                        //    required: false
                        //},
                        //{
                        //    xtype: 'currencyfield',
                        //    name: 'salePrice',
                        //    itemId: 'salePriceField',
                        //    fieldLabel: 'Sale Price',
                        //    allowBlank: true,
                        //    hideTrigger: true,
                        //    margin: '0 30 0 0',
                        //    width: '50%'
                        //}
                    ]
                }
            ]
        };

        this.bulkPanel = {
            xtype: 'panel',
            title: 'Bulk',
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
                this.basicPanel, //move to subform file
                this.bulkPanel,
                this.advancedPanel
            ]
        });

        this.items = [
            this.tabs
        ];

        // product picker
        // currency
        //  start date
        //  end date

        //   vbox
        //     vbox
        //        productPicker
        //     hbox
        //       vbox
        //         currency code
        //       hbox
        //          start date
        //          end date

        //this.items = [{
        //    xtype: 'panel',
        //    layout: {
        //        type: 'vbox',
        //        align: 'stretch'
        //    },
        //    items: [
        //        //row 1
        //        {
        //            xtype: 'panel',
        //            layout: {
        //                type: 'vbox',
        //                align: 'stretch'
        //            },
        //            items: [
        //                {
        //                    xtype: 'panel',
        //                    layout: {
        //                        type: 'hbox',
        //                        align: 'bottom'
        //                    },
        //                    width: '50%',
        //                    items: [
        //                        {
        //                            xtype: 'numberfield',
        //                            name: 'price',
        //                            itemId: 'priceField',
        //                            fieldLabel: 'Price',
        //                            allowBlank: true,
        //                            hideTrigger: true,
        //                            margin: '0 30 0 0',
        //                            width: '50%',
        //                            required: false
        //                        },
        //                        {
        //                            xtype: 'numberfield',
        //                            name: 'salePrice',
        //                            itemId: 'salePriceField',
        //                            fieldLabel: 'Sale Price',
        //                            allowBlank: true,
        //                            hideTrigger: true,
        //                            margin: '0 30 0 0',
        //                            width: '50%'
        //                        }
        //                    ]
        //                }
        //            ]
        //        },
        //        //row 2
        //        {
        //            xtype: 'panel',
        //            width: '100%',
        //            layout: 'hbox',
        //            items: [
        //                {
        //                    xtype: 'panel',
        //                    layout: {
        //                        type: 'vbox',
        //                        align: 'top'
        //                    },
        //                    width: '50%',
        //                    items: [
        //                        {
        //                            xtype: 'combobox',
        //                            name: 'currencyCode',
        //                            fieldLabel: 'Currency Code',
        //                            width: '100%',
        //                            margin: '0 30 0 0',
        //                            valueField: 'id',
        //                            displayField: 'name',
        //                            queryMode: 'local',
        //                            valueNotFoundText: 'not found',
        //                            editable: true,
        //                            forceSelection: true,
        //                            value: me.record ? me.record.get('currencyCode') : defaultCurrency,
        //                            store: currencyStore
        //                        }
        //                    ]
        //                },
        //                {
        //                    xtype: 'panel',
        //                    layout: {
        //                        type: 'hbox',
        //                        align: 'top'
        //                    },
        //                    width: '50%',
        //                    items: [
        //                        me.effectiveDate,
        //                        me.expirationDate
        //                    ]
        //                }
        //            ]
        //        }
        //    ]
        //}];

        this.callParent(arguments);
    },

    /**
     * Opens a modal with a TreePanel.
     * @private
     */
    launchSiteModal: function(list) {
        var catalogChildren = Ext.Array.map(Taco.app.context.getMasterCatalog().catalogs, function (cat) {
            var siteChildren = Ext.Array.map(cat.sites, function (site) {
                return {
                    id: site.id,
                    name: site.name,
                    parentId: cat.id,
                    type: 'site',
                    expanded: true,
                    loaded: true,
                    leaf: 'true'
                };
            });
            return {
                id: cat.id,
                name: cat.name,
                type: 'catalog',
                expanded: true,
                loaded: true,
                children: siteChildren
            };
        }),

        siteTreeStore = Ext.create('Ext.data.TreeStore', {
            root: {
                expanded: true,
                children: catalogChildren
            }
        });

        this.modal = Ext.widget('checkbox-tree-modal', {
            title: 'Select Sites',
            displayField: 'name',
            store: siteTreeStore
        });

        this.modal.on({
            savesuccess: function(modal, values) {
                list.addValue(values);
                list.store.reload();
                this.parentForm.getForm().checkValidity();
            },
            aftercancelclose: function() {
                list.store.reload();
            },
            scope: this
        });
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