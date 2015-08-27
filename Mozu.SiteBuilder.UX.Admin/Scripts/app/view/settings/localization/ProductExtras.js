/**
 * @class Taco.view.settings.localization.ProductExtras
*/
Ext.define('Taco.view.settings.localization.ProductExtras', {
    requires: ['Taco.store.LocalizedProductExtras', 'Taco.view.settings.localization.util.Currencies',
        'Taco.core.ux.form.CurrencyField'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias: 'widget.localizedproductextrasgrid',

    title: "Product Extras Pricing Grid",

    store: { type: 'Taco.store.LocalizedProductExtras' },

    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 'c', 's']
    },

    getStore: function () {
        return { type: 'Taco.store.LocalizedProductExtras' };
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
                dataIndex: 'productCode',
                text: 'Product Code' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'attributeFQN',
                text: 'Attribute Id' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'adminName',
                text: 'Attribute Admin Name' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'attributeName',
                text: 'Attribute Name' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'deltaPrice',
                text: mcCurrency + 'Price' + mcName,
                flex: 1
            }
            ];


// todo: move to superclass - Greg Murray on 2014-07-22 
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

            columns.push(createCurrencyColumn('price_' + currency, currency + ' Price'));

        });
        return columns;
    },

    getAdvancedSearchConfig: function () {
        return Taco.view.settings.localization.util.Currencies.getAdvancedSearchConfig();
    }

});

