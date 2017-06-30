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

        me.pricingStore = Ext.create('Ext.data.Store', {
            model: 'Taco.model.ProductInCatalogInfo'
        });

        me.basicPricingTable = Ext.create('Ext.grid.Panel', {
            title: 'Reference Pricing',
            store: me.pricingStore,
            /*stateful: true,
            stateId: 'priceListBasicPricingTable',*/
            columns: [{
                dataIndex: 'catalog',
                flex: 1,
                text: 'Catalog',
                hideable: false,
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return val.name
                }
            }, {
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
            }]
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
                    me.basicEntries,
                    me.basicPricingTable
                ]
            }]
        });

        me.loadEntries(this.record.get('priceEntries'));

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
            displayField: 'text',
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
                me.mapStartDate,
                me.mapEndDate
            ]
        });

        me.entryTypePicker = Ext.create('Ext.form.ComboBox', {
            name: 'priceListEntryTypeCode',
            fieldLabel: 'Entry Type',
            width: '50%',
            padding: '0 0 0 30',
            valueField: 'id',
            displayField: 'id',
            readOnly: false,
            queryMode: 'local',
            editable: true,
            forceSelection: false,
            emptyText: 'None',
            defaultValue: 'None',
            trigger2Cls: 'x-form-clear-trigger',
            onTrigger2Click: function () {
                this.setValue('');
            },
            store: {
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'value', type: 'string' }
                ]
            }
        });

        Taco.model.Attribute.load('system~price-list-entry-type', {
            success: function(attribute) {
                me.entryTypePicker.store.loadData(attribute.get('values'))
            }
        });

        me.entryTypeRow = Ext.widget('panel', {
            layout: {
                type: 'hbox'
            },
            margin: '0 0 20 0',
            items: [
                me.entryTypePicker
            ]
        });

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
                me.discountRestriction,
                me.restrictionStartDate,
                me.restrictionEndDate
            ]
        });

        me.extrasGrid = Ext.widget('taco-pricelist-entry-extras-grid', {
            record: me.record
        });

        me.advancedPricingTable = Ext.create('Ext.grid.Panel', {
            title: 'Reference Pricing',
            store: me.pricingStore,
            margin: '40 0 0 0',
            stateful: true,
            stateId: 'priceListAdvancedPricingTable',
            columns: [{
                dataIndex: 'catalog',
                stateId: 'advCat',
                flex: 2,
                text: 'Catalog',
                hideable: false,
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return val.name
                }
            }, {
                dataIndex: 'msrp',
                stateId: 'advMsrp',
                flex: 1,
                text: 'MSRP',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    var currCode = record.get('isoCurrencyCode'),
                        currency = Taco.app.context.currencies[currCode.toLowerCase()];
                    return me.formatCurrency(val, currency);
                }
            }, {
                dataIndex: 'cost',
                stateId: 'advCost',
                flex: 1,
                text: 'Cost',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    //todo:  should be cost currency code greg_murray on 6/16/2016
                    var currCode = record.get('isoCurrencyCode'),
                        currency = Taco.app.context.currencies[currCode.toLowerCase()];
                    return me.formatCurrency(val, currency);
                }
            }, {
                dataIndex: 'map',
                stateId: 'advMap',
                flex: 1,
                text: 'MAP',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    var currCode = record.get('isoCurrencyCode'),
                        currency = Taco.app.context.currencies[currCode.toLowerCase()];
                    return me.formatCurrency(val, currency);
                }
            }, {
                dataIndex: 'mapStartDate',
                stateId: 'advMapStart',
                flex: 2,
                text: 'MAP Start Date',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return Ext.util.Format.date(val, 'n/j/Y g:i a');
                }
            }, {
                dataIndex: 'mapEndDate',
                stateId: 'advMapEnd',
                flex: 2,
                text: 'MAP End Date',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return Ext.util.Format.date(val, 'n/j/Y g:i a');
                }
            }, {
                dataIndex: 'discountsRestricted',
                stateId: 'advDiscRestrict',
                flex: 2,
                hidden: true,
                text: 'Discounts Restriction',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return val;
                }
            }, {
                dataIndex: 'discountsRestrictedStartDate',
                stateId: 'advDiscRestrictStart',
                flex: 2,
                hidden: true,
                text: 'Discounts Restriction Start Date',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return Ext.util.Format.date(val, 'n/j/Y g:i a');
                }
            }, {
                dataIndex: 'discountsRestrictedEndDate',
                stateId: 'advDiscRestrictEnd',
                flex: 2,
                hidden: true,
                text: 'Discounts Restriction End Date',
                renderer: function(val, metaData, record, rowIndex, colIndex, store, view) {
                    return Ext.util.Format.date(val, 'n/j/Y g:i a');
                }
            }]
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
                me.entryTypeRow,
                {
                    items: [
                        me.msrpOverride,
                        me.costOverride,
                        {}
                    ]
                },
                me.mapRow,
                me.discountRestrictionRow,
                me.advancedPricingTable
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

        me.items = [
            me.tabs
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
            name: 'minQty',
            hideTrigger: true,
            value: entry.minQty,
            margin: '0 20 0 0',
            flex: 0.5,
            minValue: 1
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
                allowBlank: (entry.listPriceMode !== 'Overridden') || (entry.showRemove)
            }
        });

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
                currencyCode: me.currencyCode,
                value: entry.salePrice
            }
        });

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

    loadEntries: function(entries) {
        var me = this;
        me.basicEntries.removeAll();
        entries = Ext.Array.sort(entries, function(a, b) {
            return a.minQty > b.minQty;
        });

        if (entries.length === 0) {
            entries.push({
                minQty: 1
            });
        }

        Ext.Array.each(entries, function(entry, index) {
            entry.showRemove = index !== 0;
            me.basicEntries.add(me.getNewRow(entry));
        });
    },

    onProductChanged: function (data) {
        if (!data){
            data = {};
        }
        this.record.set('productInCatalogInfo', data.productInCatalogInfo);
        this.record.set('productCode', data.productCode);
        this.record.set('currentCostCurrencyCode', data.currentCostCurrencyCode);
        this.record.set('currentCost', data.currentCost);
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
        this.record.set('productCode', data.productCode);
        this.record.set('productInCatalogInfo', data.productInCatalogInfo);
        this.record.set('currentCost', data.currentCost);
        this.record.set('currentCostCurrencyCode', data.currentCostCurrencyCode);
        this.record.set('currentDiscountsRestricted', data.currentDiscountsRestricted);
        this.record.set('currentDiscountsRestrictedStartDate', data.currentDiscountsRestrictedStartDate);
        this.record.set('currentDiscountsRestrictedEndDate', data.currentDiscountsRestrictedEndDate);
        this.onPriceEntryLoaded(this.record);
    },

    onPriceEntryLoaded: function (record) {
        this.loadEntries(record.get('priceEntries'));
        this.updateExtras(record.get('extras'));
        this.injectExtrasTab(record);
        this.populatePricingTable(record);

        var entryType = record.data.priceListEntryTypeCode;

        if (entryType) {
            this.entryTypePicker.setValue(entryType);
        }
    },

    formatCurrency: function (value, currency) {
        if (!value && value !== 0) {
            return '';
        }
        return Ext.util.Format.currency(value, currency.symbol, currency.significantDecimalDigits, false);
    },

    populatePricingTable: function(record) {
        var store = this.pricingStore;
        store.removeAll();
        var entries = record.get('productInCatalogInfo') || [];
        //if (!entries) { return; }
        Ext.Array.each(entries, function(entry) {
            entry.cost = record.get('currentCost');
            entry.currentCostCurrencyCode = record.get('currentCostCurrencyCode');
            entry.discountsRestricted = record.get('currentDiscountsRestricted');
            entry.discountsRestrictedStartDate = record.get('currentDiscountsRestrictedStartDate');
            entry.discountsRestrictedEndDate = record.get('currentDiscountsRestrictedEndDate');
        });
        store.add(entries);
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