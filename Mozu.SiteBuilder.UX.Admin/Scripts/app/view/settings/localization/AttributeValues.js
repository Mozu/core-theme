/**
 * @class Taco.view.settings.localization.AttributeValues
*/
Ext.define('Taco.view.settings.localization.AttributeValues', {
    requires:['Taco.store.LocalizedAttributeValues', 'Taco.view.settings.localization.AdvancedSearchForm'],
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
            mcName = (!mc) ? '' : mc.name + ' ',
            mcLocale = (!mc) ? '' : ' (' + mc.localeCode + ')',
            columns = [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'attributeFQN',
                    text: mcName + 'Attribute Id',
                    flex: 1
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'adminName',
                    text: mcName + 'Attribute Admin Name',
                    flex: 1
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'attributeName',
                    text: mcName + 'Attribute Name' + mcLocale,
                    flex: 1
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'stringValue',
                    text: mcName + 'Label' + mcLocale,
                    flex: 1
                }
            ];

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: 'value_' + locale,
                text: 'Label (' + locale + ')',
                flex:1,
                sortable: false,
                editor: {
                    xtype: "textfield",
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
        var mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            quickFilters = [
                            [{ hasRecord: false }, 'Missing Translation'],
                            [{ hasRecord: true }, 'Has Translation'],
                            [{}, 'All Records']
            ];

        Ext.Array.each(supportedLocales, function (loc) {
            quickFilters.push([{ localeNotExists: loc }, 'Missing ' + loc]);
            quickFilters.push([{ localeExists: loc }, 'Has ' + loc]);
        });

        return {
            advancedFormCls: 'Taco.view.settings.localization.AdvancedSearchForm',

            quickFilterData: quickFilters
        };
    }

});
