/**
 * @class Taco.view.settings.localization.ProductVariants
*/
Ext.define('Taco.view.settings.localization.ProductVariants', {
    requires: ['Taco.store.LocalizedProductVariants'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias: 'widget.localizedproductvariantsgrid',

    title: "Product Variantion Pricing Grid",

    store: { type: 'Taco.store.LocalizedProductVariants' },

    contextConfig: {
        supportedLevels: ['m','c'],
        requiresContextOfType: ['m', 'c', 's']
    },

    getStore: function () {
        return { type: 'Taco.store.LocalizedProductVariants' };
    },

    // override this method and adjust the columns if you need a grid with a subset of columns;
    getColumnConfig: function () {
        var mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultCurrency = true,
            supportedCurrencies = (!mc) ? [] : mc.getSupportedCurrencies(excludeDefaultCurrency),
            columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'productName',
                text: 'MC Product Name',
                hideable: false,
                minWidth: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'options',
                text: 'MC Product Options',
                flex: 1,
                width: 150,
                renderer: function (options) {
                    if (!options || options.length == 0) return '';
                    return options.join('; ');
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'parentProductCode',
                text: 'MC Parent Product Code',
                flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'variantProductCode',
                text: 'MC Product Variation Code',
                flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaPrice',
                text: 'MC Price',
                flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaMSRP',
                text: 'MC MSRP',
                flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaCreditValue',
                text: 'MC Credit Value',
                flex: 1,
                width: 150
            }
            ];

        // todo: take into account search filter to only show currency? - Greg Murray on 2014-07-14 

        Ext.Array.each(supportedCurrencies, function (currency) {
            function createCurrencyColumn(dataIdx, colText) {
                return {
                    xtype: 'gridcolumn',
                    dataIndex: dataIdx,
                    text: colText,
                    flex: 1,
                    width: 150,
                    sortable: false,
                    resizable: false,
                    menuDisabled: true,
                    editor: {
                        xtype: "currencyfield",
                        showBorder: true,
                        hideTrigger: true,
                        emptyText: "missing",
                        msgTarget: "qtip",
                        selectOnFocus: true,
                        allowBlank: true
                    }
                };
            }

            columns.push(createCurrencyColumn('price_' + currency, 'Price (' + currency + ')'));
            columns.push(createCurrencyColumn('msrp_' + currency, 'MSRP (' + currency + ')'));
            columns.push(createCurrencyColumn('credit_' + currency, 'Credit Value (' + currency + ')'));

        });
        return columns;
    },

    getAdvancedSearchConfig: function () {
        var mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultCurrency = true,
            supportedCurrencies = (!mc) ? [] : mc.getSupportedCurrencies(excludeDefaultCurrency),
            quickFilters = [
                            [{ hasRecord: false }, 'Missing Currency'],
                            [{ hasRecord: true }, 'Has Currency'],
                            [{}, 'All Records']
            ];

        Ext.Array.each(supportedCurrencies, function (cur) {
            quickFilters.push([{ localeNotExists: cur }, 'Missing ' + cur]);
            quickFilters.push([{ localeExists: cur }, 'Has ' + cur]);
        });

        return {
            advancedFormCls: 'Taco.view.settings.localization.AdvancedSearchForm',

            quickFilterData: quickFilters
        };
    }

});


