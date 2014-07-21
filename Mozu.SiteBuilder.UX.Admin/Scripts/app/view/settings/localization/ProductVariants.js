/**
 * @class Taco.view.settings.localization.ProductVariants
*/
Ext.define('Taco.view.settings.localization.ProductVariants', {
    requires: ['Taco.store.LocalizedProductVariants', 'Taco.view.settings.localization.AdvancedSearchForm', 'Taco.core.ux.form.CurrencyField'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias: 'widget.localizedproductvariantsgrid',

    title: "Product Variation Pricing Grid",

    store: { type: 'Taco.store.LocalizedProductVariants' },

    contextConfig: {
        supportedLevels: ['m','c'],
        requiresContextOfType: ['m', 'c', 's']
    },

    getStore: function () {
        return { type: 'Taco.store.LocalizedProductVariants' };
    },

    getColumnConfig: function () {
        var ctx = Taco.app.context.getCurrentContext(),
            ctxType = (!ctx) ? '' : ctx.contextType,
            mc = Taco.app.context.getMasterCatalog(),
            mcCurrency = (!mc) ? '' : ' (' + mc.currencyCode + ')',
            mcName = (!mc) ? '' : mc.name + ' ',
            excludeDefaultCurrency = true,
            supportedCurrencies = [],
            columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'productName',
                text: mcName + 'Product Name',
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'options',
                text: mcName + 'Product Options',
                flex: 1,
                renderer: function (options) {
                    if (!options || options.length == 0) return '';
                    return options.join('; ');
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'parentProductCode',
                text: mcName + 'Parent Product Code',
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'variantProductCode',
                text: mcName + 'Product Variation Code',
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaPrice',
                text: mcName + 'Price' + mcCurrency,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaMSRP',
                text: mcName + 'MSRP' + mcCurrency,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaCreditValue',
                text: mcName + 'Credit Value' + mcCurrency,
                flex: 1
            }
            ];

        if (ctxType === 'm' && mc) {
            supportedCurrencies = mc.getSupportedCurrencies(excludeDefaultCurrency);
        }
        else if (ctxType === 'c') {
            var cat = Taco.app.context.getCatalog();
            if (cat) {
                supportedCurrencies.push(cat.currencyCode);
            }
        }

        Ext.Array.each(supportedCurrencies, function (currency) {
            function createCurrencyColumn(dataIdx, colText) {
                return {
                    xtype: 'gridcolumn',
                    dataIndex: dataIdx,
                    text: colText,
                    flex: 1,
                    sortable: false,
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


