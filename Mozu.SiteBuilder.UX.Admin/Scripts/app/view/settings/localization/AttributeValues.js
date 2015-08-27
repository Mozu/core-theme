/**
 * @class Taco.view.settings.localization.AttributeValues
*/
Ext.define('Taco.view.settings.localization.AttributeValues', {
    requires: ['Taco.store.LocalizedAttributeValues', 'Taco.view.settings.localization.util.Locales'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias: 'widget.localizedattributevaluesgrid',

    title: "Attribute Value Localization Grid",

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    store: { type: 'Taco.store.LocalizedAttributeValues' },

    getStore: function () {
        return { type: 'Taco.store.LocalizedAttributeValues' };
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
                    text: mcLocale + 'Attribute Name' + mcName,
                    flex: 1
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'stringValue',
                    text: mcLocale + 'Label' + mcName,
                    flex: 1
                }
            ];

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: 'value_' + locale,
                text: locale + ' Label',
                flex:1,
                sortable: false,
                editor: {
                    xtype: "textarea",
                    showBorder: true,
                    hideTrigger: true,
                    emptyText: "missing",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: true
                }
            };
            columns.push(col);
        });
        return columns;
    },

    getAdvancedSearchConfig: function () {
        return Taco.view.settings.localization.util.Locales.getAdvancedSearchConfig();
    }

});
