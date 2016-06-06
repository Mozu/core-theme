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
        'Taco.view.priceList.widget.EntryExtrasGrid',
        'Taco.view.priceList.widget.CurrentValueLabel'
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

        me.basicEntries = Ext.create('Ext.panel.Panel', {
            itemId: 'basicEntries',
            layout: {
                type: 'vbox',
                align: 'stretch',
                defaults: {
                    flex: 1
                }
            }
        });

        me.basicPanel = Ext.create('Ext.panel.Panel', {
            title: 'Basic',
            itemId: 'basicPanel',
            width: '50%',
            padding: '20',
            items: [{
                xtype: 'container',
                items: [
                    {
                        xtype: 'container',
                        defaults: {
                            flex: 1,
                            xtype: 'label'
                        },
                        layout: {
                            type: 'hbox',
                            align: 'stretch'
                        },
                        items: [
                            {
                                text: 'Minimum Quantity',
                                flex: 0.5,
                                margin: '0 20 0 0'
                            },
                            {
                                text: 'Price'
                            },
                            {
                                text: 'Sale Price'
                            },
                            {}
                        ]
                    },
                    me.basicEntries
                ]
            }]
        });

        var entries = Ext.Array.sort(this.record.get('priceEntries'), function(a, b) {
            return a.minQty > b.minQty;
        });

        if (entries.length === 0) {
            entries.push(
                me.getNewRow({
                    minQty: 1
                })
            );
        }

        Ext.Array.each(entries, function(entry, index) {
            entry.showRemove = index !== 0;
            me.basicEntries.add(me.getNewRow(entry));
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

        me.currentMapStartDate = Ext.widget('current-value-label', {});
        me.currentMapEndDate = Ext.widget('current-value-label', {});

        me.mapRow = Ext.widget('panel', {
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'top'
            },
            padding: '30 0 0 0',
            hidden: me.record.get('isVariation'),
            defaults: {
                flex: 1
            },
            items: [
                me.mapOverride,
                me.createCurrentWidget(me.mapStartDate, me.currentMapStartDate),
                me.createCurrentWidget(me.mapEndDate, me.currentMapEndDate)
            ]
        });

        me.currentRestriction = Ext.widget('current-value-label', {});
        me.currentRestrictionStartDate = Ext.widget('current-value-label', {});
        me.currentRestrictionEndDate = Ext.widget('current-value-label', {});

        me.discountRestrictionRow = Ext.widget('panel', {
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'top'
            },
            padding: '30 0 0 0',
            hidden: me.record.get('isVariation'),
            defaults: {
                flex: 1
            },
            items: [
                me.createCurrentWidget(me.discountRestriction, me.currentRestriction), //, '0 50 0 0'),
                me.createCurrentWidget(me.restrictionStartDate, me.currentRestrictionStartDate), //, '0 50 0 0'),
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
            style: {
                borderColor: '#cccccc'
            },
            items: [
                me.basicPanel, //move to subform file?
                me.advancedPanel
            ]
        });


        me.pricingTable = Ext.create('Ext.grid.Panel', {
            title: 'Pricing',
            store: Ext.create('Ext.data.Store', {
                model: 'Taco.model.ProductInCatalogInfo'
            }),
            /*stateful: true,
            stateId: 'priceListPricingTable',*/
            columns: [{
                dataIndex: 'catalogId',
                flex: 1,
                text: 'Catalog',
                hideable: false,
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    var catalog = Ext.Array.findBy(Taco.app.context.getMasterCatalog().catalogs, function(catalog) {
                        return val === catalog.id;
                    })
                    return catalog.name
                }
            }, /*{
                dataIndex: 'minQty',
                flex: 1,
                text: 'Minimum Quantity',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return val;
                }
            },*/ {
                dataIndex: 'listPrice',
                flex: 1,
                text: 'Price',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    var currCode = record.get('isoCurrencyCode'),
                        currency = Taco.app.context.currencies[currCode.toLowerCase()];
                    return me.formatCurrency(val, currency);
                }
            }, {
                dataIndex: 'salePrice',
                flex: 1,
                text: 'Sale Price',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    var currCode = record.get('isoCurrencyCode'),
                        currency = Taco.app.context.currencies[currCode.toLowerCase()];
                    return me.formatCurrency(val, currency);
                }
            }, {
                dataIndex: 'msrp',
                flex: 1,
                text: 'MSRP',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    var currCode = record.get('isoCurrencyCode'),
                        currency = Taco.app.context.currencies[currCode.toLowerCase()];
                    return me.formatCurrency(val, currency);
                }
            },]
        });

        me.items = [
            me.tabs,
            me.pricingTable
        ];

        me.mon(Taco.app, 'price-entry-loaded', me.onPriceEntryLoaded, me);
        me.mon(Taco.app, 'price-entry-product-changed', me.onProductChanged, me);
        me.mon(Taco.app, 'price-entry-product-variation-changed', me.onProductVariationChanged, me);

        me.callParent(arguments);
    },

    getNewRow: function(entry) {
        
        var me = this;

        entry = entry || {};

        var row = Ext.widget('container');

        row.minQty = Ext.widget('numberfield', {
            //fieldLabel: 'Minimum Quantity',
            name: 'minQty',
            hideTrigger: true,
            value: entry.minQty,
            margin: '0 20 0 0',
            flex: 0.5
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
                currencyCode: me.currencyCode,
                value: entry.listPrice,
                allowBlank: (entry.listPriceMode !== 'Overridden') || (entry.showRemove),
                emptyText: entry.showRemove || entry.minQty > 1 ? '' : 'Default'
            }
        });

        if (!me.priceOverrideFirst) {
            me.priceOverrideFirst = row.priceOverride;
        }

        row.priceOverride.overrideField.validate();

        row.salePriceOverride = Ext.widget('overridefield', {
            listeners: {
                beforerender: function(cmp) {
                    if (cmp.isOverridden()) {
                        Ext.apply(cmp.overrideField, { emptyText: '' })
                    }
                },
                scope: row.salePriceOverride
            },
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
                currencyCode: me.currencyCode,
                value: entry.salePrice,
                emptyText: entry.showRemove || entry.minQty > 1 ? '' : 'Default'
            }
        });

        if (!me.salePriceOverrideFirst) {
            me.salePriceOverrideFirst = row.salePriceOverride;
        }

        row.addButton = Ext.widget('button', {
            cls: 'taco-btn-add-row',
            handler: function() {
                var index = 0;
                me.basicEntries.items.each(function(item, indx) { 
                    if (item.isAncestor(this)) { 
                        index = indx + 1;
                        return false;
                    }
                }, this, true); // true to reverse since its most likely to be adding one to the end
                me.basicEntries.insert(index,
                    me.getNewRow({
                        showRemove: true
                    })
                );
            }
        })

        row.removeButton = Ext.widget('button', {
            cls: 'taco-btn-remove-row',
            hidden: !entry.showRemove,
            handler: function() {
                var formRow = this.up('form');
                me.basicEntries.remove(formRow);
            }
        })


        var rowForm = {
            xtype: 'form',
            layout: {
                type: 'hbox',
                align: 'top'
            },
            margin: '0',
            height: 60,
            record: Ext.create('Taco.model.PriceListEntryPrice', entry),
            defaults: {
                flex: 1
            },
            items: [
                row.minQty,
                row.priceOverride,
                row.salePriceOverride,
                {
                    xtype: 'container',
                    defaults: {
                        margin: '10 20 0 0'
                    },
                    items: [
                        row.addButton,
                        row.removeButton
                    ],
                    layout: {
                        type: 'hbox',
                        align: 'top'
                    }
                }
            ]
        };

        return rowForm;

    },

    createCurrentWidget: function(overrideField, currentVal) { // ,margin) {
        //margin = margin || '0';
        return {
            xtype: 'fieldcontainer',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            //padding: margin,
            items: [
                overrideField,
                currentVal
            ]
        };
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
        this.record.set('productInCatalogInfo', data.productInCatalogInfo);
        this.record.set('currentListPrice', data.currentListPrice);
        this.record.set('currentSalePrice', data.currentSalePrice);
        this.record.set('currentCost', data.currentCost);
        this.record.set('currentMap', data.currentMap);
        this.record.set('currentMapStartDate', data.currentMapStartDate);
        this.record.set('currentMapEndDate', data.currentMapEndDate);
        this.record.set('currentMsrp', data.currentMsrp);
        this.record.set('currentDiscountsRestricted', data.currentDiscountsRestricted);
        this.record.set('currentDiscountsRestrictedStartDate', data.currentDiscountsRestrictedStartDate);
        this.record.set('currentDiscountsRestrictedEndDate', data.currentDiscountsRestrictedEndDate);
        this.record.set('extras', data.extras);
        this.onPriceEntryLoaded(this.record);
    },

    onProductVariationChanged: function (data) {
        if (!data){
            data = {};
        }
        this.record.set('isVariation', true);
        this.record.set('productInCatalogInfo', data.productInCatalogInfo);
        this.record.set('currentListPrice', data.currentListPrice);
        this.record.set('currentSalePrice', data.currentSalePrice);
        this.record.set('currentCost', data.currentCost);
        this.record.set('currentMsrp', data.currentMsrp);
        this.onPriceEntryLoaded(this.record);
    },

    onPriceEntryLoaded: function (record) {
        this.populatePricingTable(record);
        this.currentMapStartDate.setValue(Ext.util.Format.date(record.get('currentMapStartDate'), 'd M, Y, g:i a'));
        this.currentMapEndDate.setValue(Ext.util.Format.date(record.get('currentMapEndDate'), 'd M, Y, g:i a'));
        this.currentRestriction.setValue(record.get('currentDiscountsRestricted'));
        this.currentRestrictionStartDate.setValue(Ext.util.Format.date(record.get('currentDiscountsRestrictedStartDate'), 'd M, Y, g:i a'));
        this.currentRestrictionEndDate.setValue(Ext.util.Format.date(record.get('currentDiscountsRestrictedEndDate'), 'd M, Y, g:i a'));

        this.updateExtras(record.get('extras'));
        this.injectExtrasTab(record);
    },

    formatCurrency: function (value, currency) {
        if (!value && value !== 0) {
            return '';
        }
        return Ext.util.Format.currency(value, currency.symbol, currency.significantDecimalDigits, false);
    },

    populatePricingTable: function(record) {
        var store = this.pricingTable.getStore();
        store.removeAll();
        store.loadData(record.get('productInCatalogInfo'));
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