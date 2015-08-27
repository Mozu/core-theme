/**
 * @class Taco.view.settings.localization.Attributes
*/
Ext.define('Taco.view.settings.localization.Attributes', {
    requires: ['Taco.store.LocalizedAttributes', 'Taco.view.settings.localization.util.Locales'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias :'widget.localizedattributesgrid',

    title: "Attribute Localization Grid",

    contextConfig: {
        supportedLevels: ['m'],
        requiresContextOfType: ['m', 'c', 's']
    },

    store: { type: 'Taco.store.LocalizedAttributes' },


    getStore: function() {
        return { type: 'Taco.store.LocalizedAttributes' };
    },

    getColumnConfig: function() {
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
                flex:1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'adminName',
                text: 'Attribute Admin Name' + mcName,
                flex: 1
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                text: mcLocale + 'Attribute Name' + mcName,
                flex: 1
            }
        ];

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: 'name_' + locale,
                text: locale + ' Attribute Name',
                flex: 1,
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


