/**
 * @class Taco.view.settings.localization.ProductVariants
*/
Ext.define('Taco.view.settings.localization.ProductVariants', {
    requires: ['Taco.store.LocalizedProductVariants', 'Taco.view.settings.localization.util.Currencies',
        'Taco.core.ux.form.CurrencyField'],
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
            mcCurrency = (!mc) ? '' : mc.currencyCode + ' ',
            mcName = (!mc) ? '' : ': ' + mc.name,
            excludeDefaultCurrency = true,
            supportedCurrencies = [],
            columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'productName',
                text: 'Product Name' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'options',
                text: 'Product Options' + mcName,
                flex: 1,
                renderer: function (options) {
                    if (!options || options.length == 0) {
                         return '';
                    }
                    return options.join('; ');
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'parentProductCode', //'variantProductCode',
                text: 'Parent Product Code' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'variantProductCode', //'variationKey',
                text: 'Product Variation Code' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaPrice',
                text: mcCurrency + 'Extra Price' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaMSRP',
                text: mcCurrency + 'MSRP' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaCreditValue',
                text: mcCurrency + 'Extra Credit Value' + mcName,
                flex: 1
            }
            ];

        if (ctxType === 'm' && mc) {
            supportedCurrencies = mc.getSupportedCurrencies(excludeDefaultCurrency);
        }
        else if (ctxType === 'c') {
            var cat = Taco.app.context.getCatalog();
            if (cat && cat.currencyCode !== mc.currencyCode) {
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

            columns.push(createCurrencyColumn('price_' + currency, currency + ' Extra Price'));
            columns.push(createCurrencyColumn('msrp_' + currency, currency + ' MSRP'));
            columns.push(createCurrencyColumn('credit_' + currency, currency + ' Extra Credit Value'));

        });
        return columns;
    },

    getAdvancedSearchConfig: function () {
        return Taco.view.settings.localization.util.Currencies.getAdvancedSearchConfig();
    }

});


