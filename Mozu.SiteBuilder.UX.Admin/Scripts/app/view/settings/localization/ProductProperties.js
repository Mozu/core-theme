/**
 * @class Taco.view.settings.localization.ProductProperties
*/
Ext.define('Taco.view.settings.localization.ProductProperties', {
    requires: ['Taco.store.LocalizedProductProperties', 'Taco.view.settings.localization.AdvancedSearchLocaleForm'],
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
            supportedLocales = [],
            mcName = (!mc) ? '' : mc.name + ' ',
            mcLocale = (!mc) ? '' : ' (' + mc.localeCode + ')',
            columns = [
                {
                    xtype: 'gridcolumn',
                    dataIndex: 'productCode',
                    text: mcName + 'Product Code',
                    flex: 1
                },{
                    xtype: 'gridcolumn',
                    dataIndex: 'productName',
                    text: mcName + 'Product Name',
                    flex: 1
                },{
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
                    dataIndex: 'stringValue',
                    text: mcName + 'Text' + mcLocale,
                    flex: 1
                }
            ];
        supportedLocales = this.getSupportedLocales();

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: 'value_' + locale,
                text: 'Text (' + locale + ')',
                flex: 1,
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
        return {
            advancedFormCls: 'Taco.view.settings.localization.AdvancedSearchLocaleForm',

            quickFilterData: this.getQuickFilterLocaleData()
        };
    }

});
