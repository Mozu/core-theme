/**
 * @class Taco.view.settings.localization.ProductProperties
*/
Ext.define('Taco.view.settings.localization.ProductProperties', {
    requires: ['Taco.store.LocalizedProductProperties', 'Taco.view.settings.localization.util.Locales'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias: 'widget.localizedproductpropertiesgrid',

    title: "Product Properties Localization Grid",

    store: { type: 'Taco.store.LocalizedProductProperties' },

    contextConfig: {
        supportedLevels: ['m', 'c'],
        requiresContextOfType: ['m', 'c', 's']
    },

    getStore: function () {
        return { type: 'Taco.store.LocalizedProductProperties' };
    },

    getColumnConfig: function () {
        var mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            mcName = (!mc) ? '' : ': ' + mc.name,
            mcLocale = (!mc) ? '' : mc.localeCode + ' ',
            columns = [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'productCode',
                    text: 'Product Code' + mcName,
                    flex: 1
                },{
                    xtype: 'gridcolumn',
                    dataIndex: 'productName',
                    text: 'Product Name' + mcName,
                    flex: 1
                },{
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
                    dataIndex: 'stringValue',
                    text: mcLocale + 'Text' + mcName,
                    flex: 1,
                    editor: {
                        xtype: "textarea",
                        showBorder: true,
                        hideTrigger: true,
                        emptyText: "missing",
                        msgTarget: "qtip",
                        selectOnFocus: true
                    },
                    renderer: function (value) {
                        return Ext.String.htmlEncode(value);
                    }
                }
            ];
        supportedLocales = Taco.view.settings.localization.util.Locales.getSupported();

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: 'value_' + locale,
                text: locale + ' Text',
                flex: 1,
                sortable: false,
                editor: {
                    xtype: "textarea",
                    showBorder: true,
                    hideTrigger: true,
                    emptyText: "missing",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: true
                },
                renderer: function (value) {
                    return Ext.String.htmlEncode(value);
                }
            };
            if (locale !== mc.localeCode) {
                columns.push(col);
            }
        });
        return columns;
    },

    getAdvancedSearchConfig: function () {
        return Taco.view.settings.localization.util.Locales.getAdvancedSearchConfig();
    }

});
