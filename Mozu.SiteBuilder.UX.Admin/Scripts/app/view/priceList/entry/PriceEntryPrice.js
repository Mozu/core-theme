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


        var entries = this.record.get('priceEntries');

        if (entries.length === 0) {
            entries.push({
                minQty: 1
            });
        }

        Ext.Array.each(entries, function(entry) {
            
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
                    onChange: function(newVal) {
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

            if (!me.priceOverrideFirst) {
                me.priceOverrideFirst = row.priceOverride;
            }

            row.priceOverride.overrideField.validate();

            row.salePriceOverride = Ext.widget('overridefield', {
                checkboxCfg: {
                    checked: entry.salePriceMode === 'Overridden',
                    onChange: function(newVal) {
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

            if (!me.salePriceOverrideFirst) {
                me.salePriceOverrideFirst = row.salePriceOverride;
            }

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
                onChange: function(newVal) {
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

        me.currentMapStartDate = Ext.widget('label', {
            cls: 'taco-rolledup-price',
            text: '',
            style: 'text-align: right',
            forId: me.itemId,
            defaultAlign: 'br?'
        });

        me.currentMapEndDate = Ext.widget('label', {
            //forId: 'myFieldId',
            cls: 'taco-rolledup-price',
            text: '',
            style: 'text-align: right',
            forId: me.itemId,
            defaultAlign: 'br?'
        });

        me.mapRow = Ext.widget('panel', {
            flex: 1,
            xtype: 'panel',
            layout: {
                type: 'hbox',
                align: 'top'
            },
            padding: '20 0 20 0',
            hidden: me.record.get('isVariation'),
            defaults: {
                flex: 1
            },
            items: [
                me.mapOverride,
                {
                    xtype: 'fieldcontainer',
                    layout: 'vbox',
                    items: [
                        me.mapStartDate,
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            items: [{
                                xtype: 'label',
                                cls: 'taco-rolledup-price',
                                text: 'Default:',
                                style: 'text-align: left',
                                margin: '0 10 0 0',
                                forId: me.itemId,
                                defaultAlign: 'bl?'
                            },
                                me.currentMapStartDate
                            ]
                        }
                    ]
                },
                {
                    xtype: 'fieldcontainer',
                    layout: 'vbox',
                    items: [
                        me.mapEndDate,
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            items: [{
                                xtype: 'label',
                                cls: 'taco-rolledup-price',
                                text: 'Default:',
                                style: 'text-align: left',
                                margin: '0 10 0 0',
                                forId: me.itemId,
                                defaultAlign: 'bl?'
                            },
                                me.currentMapEndDate
                            ]
                        }
                    ]
                }

            ]
        });

        me.currentRestriction = Ext.widget('label', {
            //forId: 'myFieldId',
            cls: 'taco-rolledup-price',
            text: '',
            style: 'text-align: right',
            forId: me.discountRestriction.itemId,
            defaultAlign: 'br?'
        });

        me.currentRestrictionStartDate = Ext.widget('label', {
            //forId: 'myFieldId',
            cls: 'taco-rolledup-price',
            text: '',
            style: 'text-align: right',
            forId: me.restrictionStartDate.itemId,
            defaultAlign: 'br?'
        });

        me.currentRestrictionEndDate = Ext.widget('label', {
            //forId: 'myFieldId',
            cls: 'taco-rolledup-price',
            text: '',
            style: 'text-align: right',
            forId: me.restrictionEndDate,
            defaultAlign: 'br?'
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
                me.createCurrentWidget(me.discountRestriction, me.currentRestriction),
                me.createCurrentWidget(me.restrictionStartDate, me.currentRestrictionStartDate),
                me.createCurrentWidget(me.restrictionEndDate, me.currentRestrictionEndDate)
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

        me.items = [
            me.tabs
        ];

        me.mon(Taco.app, 'price-entry-loaded', me.onPriceEntryLoaded, me);
        me.mon(Taco.app, 'price-entry-product-changed', me.onProductChanged, me);

        me.callParent(arguments);
    },

    // createCurrentCurrencyField: function (fieldName, fieldLabel) {
    //     return Ext.widget('currencyfield', {
    //         name: fieldName,
    //         currencyCode: this.currencyCode,
    //         fieldLabel: fieldLabel,
    //         itemId: fieldName,
    //         hideTrigger: true,
    //         margin: '0 30 0 45',
    //         readOnly: true,
    //         disabled: true,
    //         fieldStyle: 'text-align: right'
    //         //labelAlign: 'right'
    //     });
    // },

    createCurrentWidget: function(overrideField, labelField) {
        return {
            xtype: 'fieldcontainer',
            layout: 'vbox',
            items: [
            overrideField, {
                xtype: 'fieldcontainer',
                layout: 'hbox',
                items: [{
                        xtype: 'label',
                        cls: 'taco-rolledup-price',
                        text: 'Default:',
                        style: 'text-align: left',
                        margin: '0 10 0 0',
                        forId: overrideField.itemId,
                        defaultAlign: 'bl?'
                    },
                   labelField
                ]
            }]
        }
    },
    
    updateExtras: function (data) {
        if (!data) {
            data = [];
        }
        this.record.set('extras', data);
        this.extrasGrid.getStore().loadData(data);
    },

    injectExtrasTab: function(record) {
        var me = this,
            extraTabExists = Ext.Array.some(me.tabs.items.items, function(item) {
            return item.itemId === me.extrasPanel.itemId;
        });
        if (!record || record.get('isVariation') || record.get('extras').length === 0) {
            if (extraTabExists) {
                me.tabs.remove(me.extrasPanel, false);
            }
        } else if (!extraTabExists) {
            me.tabs.add(me.extrasPanel);
        }
    },

    onProductChanged: function (data) {
        if (!data){
            data = {};
        }
        this.record.set('currentListPrice', data.currentListPrice);
        this.record.set('currentSalePrice', data.currentSalePrice);
        this.record.set('currentCost', data.currentCost);
        this.record.set('currentMap', data.currentMap);
        this.record.set('currentMapStartDate', data.currentMapStartDate);
        this.record.set('currentMapEndDate', data.currentMapEndDate);
        this.record.set('currentMsrp', data.currentMsrp);
        this.record.set('currentDiscountsRestricted', data.currentDiscountsRestricted);
        this.record.set('currentDiscountsStartDate', data.currentDiscountsStartDate);
        this.record.set('currentDiscountsEndDate', data.currentDiscountsEndDate);
        this.record.set('extras', data.extras);
        this.onPriceEntryLoaded(this.record);
    },

    onPriceEntryLoaded: function (record) {
        var currCode = record.get('currentPriceCurrencyCode') || this.currencyCode,
            currency = Taco.app.context.currencies[currCode.toLowerCase()];

        this.priceOverrideFirst.setCurrentPrice(this.formatCurrency(record.get('currentListPrice'), currency));
        this.salePriceOverrideFirst.setCurrentPrice(this.formatCurrency(record.get('currentSalePrice'), currency));
        this.msrpOverride.setCurrentPrice(this.formatCurrency(record.get('currentMsrp'), currency));
        this.costOverride.setCurrentPrice(this.formatCurrency(record.get('currentCost'), currency));
        this.mapOverride.setCurrentPrice(this.formatCurrency(record.get('currentMap'), currency));
        this.currentMapStartDate.setText(Ext.util.Format.date(record.get('currentMapStartDate'), 'd M, Y, g:i a'));
        this.currentMapEndDate.setText(Ext.util.Format.date(record.get('currentMapEndDate'), 'd M, Y, g:i a'));
        this.currentRestriction.setText(record.get('currentDiscountsRestricted'));
        this.currentRestrictionStartDate.setText(Ext.util.Format.date(record.get('currentDiscountsRestrictedStartDate'), 'd M, Y, g:i a'));
        this.currentRestrictionEndDate.setText(Ext.util.Format.date(record.get('currentDiscountsRestrictedEndDate'), 'd M, Y, g:i a'));

        this.updateExtras(record.get('extras'));
        this.injectExtrasTab(record);
    },

    formatCurrency: function (value, currency) {
        if (!value && value !== 0) {
            return '';
        }
        return Ext.util.Format.currency(value, currency.symbol, currency.significantDecimalDigits, false);
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