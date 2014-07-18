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

    // override this method and adjust the columns if you need a grid with a subset of columns;
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
                hideable: true,
                minWidth: 150,
                width:200
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'options',
                text: mcName + 'Product Options',
                flex: 1,
                //width: 150,
                renderer: function (options) {
                    if (!options || options.length == 0) return '';
                    return options.join('; ');
                }
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'parentProductCode',
                text: mcName + 'Parent Product Code',
                hideable: true,
                //flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'variantProductCode',
                text: mcName + 'Product Variation Code',
                //flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaPrice',
                text: mcName + 'Price' + mcCurrency,
                hideable: true,
                //flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaMSRP',
                text: mcName + 'MSRP' + mcCurrency,
                hideable: true,
                //flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaCreditValue',
                text: mcName + 'Credit Value' + mcCurrency,
                hideable: true,
                //flex: 1,
                width: 150
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

        // todo: take into account search filter to only show currency? - Greg Murray on 2014-07-14 

        Ext.Array.each(supportedCurrencies, function (currency) {
            function createCurrencyColumn(dataIdx, colText) {
                return {
                    xtype: 'gridcolumn',
                    dataIndex: dataIdx,
                    text: colText,
                    hideable: true,
                    //flex: 1,
                    width: 150,
                    sortable: false,
                    resizable: true,
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


