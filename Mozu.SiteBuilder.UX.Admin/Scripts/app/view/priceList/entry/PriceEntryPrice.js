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
        'Taco.model.PriceListEntryExtra',
        'Taco.core.ux.form.CurrencyField',
        'Ext.form.field.Date',
        'Taco.core.ux.TooltipLabel',
        'Taco.core.util.Validation',
        'Taco.shared.view.field.ProductPickerField',
        'Taco.view.priceList.widget.PriceListComboBox',
        'Taco.core.ux.picker.CheckboxTreeModal',
        'Taco.view.priceList.widget.OverrideField',
        'Taco.view.product.widget.ProductBundleGrid',
        'Taco.view.priceList.widget.EntryExtrasGrid'
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
                align: 'top'
            },
            width: '50%',
            padding: '20 0 0 20',
            defaults: {
                flex: 1
                // defaults: {
                //     flex: 1
                // }
            },
            items: []
        });

        me.curListPrice = me.createCurrentCurrencyField('currentListPrice', 'Current Price');
        me.curSalePrice = me.createCurrentCurrencyField('currentSalePrice', 'Current Sale Price');

        me.basicPanel.add({
            xtype: 'fieldcontainer',
            layout: {
                type: 'hbox',
                align: 'top'
            },
            defaults: {
                flex: 1
            },
            items: [
                me.curListPrice,
                me.curSalePrice
            ]
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

        // me.basicPanel.add({
        //     xtype: 'fieldcontainer',
        //     layout: {
        //         type: 'hbox',
        //         align: 'top'
        //     },
        //     defaults: {
        //         flex: 1
        //     },
        //     items: [
        //         me.curListPrice,
        //         me.curSalePrice
        //     ]
        // });

        me.curMsrp = me.createCurrentCurrencyField('currentMsrp', 'Current MSRP');
        me.curCost = me.createCurrentCurrencyField('currentCost', 'Current Cost');

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

        me.extrasGrid = Ext.widget('taco-pricelist-entry-extras-grid', {
            record: me.record
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
                    xtype: 'fieldcontainer',
                    layout: {
                        type: 'hbox',
                        align: 'top'
                    },
                    defaults: {
                        flex: 1
                    },
                    items: [
                        me.curMsrp,
                        me.curCost,
                        {}
                    ]
                },
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

        me.extrasPanel = Ext.create('Ext.panel.Panel', {
            title: 'Extras',
            itemId: 'extrasPanel',
            layout: 'fit',
            padding: '20',
            items: [me.extrasGrid]
        });

        me.tabs = Ext.create('Ext.tab.Panel', {
            width: "100%",
            //minHeight: 475,
            style: {
                borderColor: '#cccccc'
            },
            items: [
                me.basicPanel, //move to subform file?
                me.advancedPanel
            ]
        });

        me.injectExtrasTab(me.record);

        me.items = [
            me.tabs
        ];

        me.mon(Taco.app, 'price-entry-loaded', me.onPriceEntryLoaded, me);
        me.mon(Taco.app, 'price-entry-product-changed', me.onProductChanged, me);
        me.mon(Taco.app, 'price-entry-product-extras-changed', me.updateExtras, me);
        var extras = me.record.get('extras');
        if (!extras) {
            me.getExtras(me.record);
        } else {
            Taco.app.fireEvent('price-entry-product-extras-changed', { items: extras });
        }
        me.callParent(arguments);
    },

    createCurrentCurrencyField: function (fieldName, fieldLabel) {
        return Ext.widget('currencyfield', {
            name: fieldName,
            currencyCode: this.currencyCode,
            fieldLabel: fieldLabel,
            itemId: fieldName,
            hideTrigger: true,
            margin: '0 30 0 45',
            readOnly: true,
            disabled: true,
            fieldStyle: 'text-align: right'
            //labelAlign: 'right'
        });
    },
    
    updateExtras: function (data) {
        if (!data || !data.items ) {
            data.items = [];
        }
        this.record.set('extras', data.items);
        this.extrasGrid.getStore().loadData(data.items);
    },

    onProductChanged: function (record) {
        this.injectExtrasTab(record);
        this.setCurrency(this.curListPrice, record.get('price'), this.currencyCode);
        this.setCurrency(this.curSalePrice, record.get('salePrice'), this.currencyCode);
    },

    injectExtrasTab: function(record) {
        var me = this;
        if (!record || record.get('isVariation') || record.get('productCode') === '') {
            me.tabs.remove(me.extrasPanel, false)
        } else {
            var exists = Ext.Array.some(me.tabs.items.items, function(item) { return item.itemId === me.extrasPanel.itemId });
            if (!exists) {
                me.tabs.add(me.extrasPanel);
            }
        }
    },

    onPriceEntryLoaded: function (record) {
        this.setCurrency(this.curListPrice, record.get('currentListPrice'), record.get('currentPriceCurrencyCode'));
        this.setCurrency(this.curSalePrice, record.get('currentSalePrice'), record.get('currentPriceCurrencyCode'));
        this.setCurrency(this.curMsrp, record.get('currentMsrp'), record.get('currentPriceCurrencyCode'));
        this.setCurrency(this.curCost, record.get('currentCost'), record.get('currentPriceCurrencyCode'));


    },

    setCurrency: function (currencyField, amount, currencyCode) {
        currencyField.currencyCode = currencyCode;
        currencyField.setValue(amount);
    },
    
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