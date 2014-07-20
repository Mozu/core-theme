/**
 * @class Taco.view.settings.localization.ProductProperties
*/
Ext.define('Taco.view.settings.localization.ProductProperties', {
    requires: ['Taco.store.LocalizedProductProperties', 'Taco.view.settings.localization.AdvancedSearchForm'],
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

    // override this method and adjust the columns if you need a grid with a subset of columns;
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
                    hideable: true,
                    minWidth: 300
                },{
                    xtype: 'gridcolumn',
                    dataIndex: 'productName',
                    text: mcName + 'Product Name',
                    hideable: true,
                    minWidth: 300
                },{
                    xtype: 'gridcolumn',
                    dataIndex: 'attributeFQN',
                    text: mcName + 'Attribute Id',
                    hideable: true,
                    minWidth: 300
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'adminName',
                    text: mcName + 'Attribute Admin Name',
                    hideable: true,
                    flex: 1
                }, {
                    xtype: 'gridcolumn',
                    dataIndex: 'stringValue',
                    text: mcName + 'Text' + mcLocale,
                    hideable: true,
                    //flex: 1,
                    width: 150
                }
            ];
        supportedLocales = this.getSupportedLocales();

        // todo: take into account search filter to only show language? - Greg Murray on 2014-07-14 

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: 'value_' + locale,
                text: 'Text (' + locale + ')',
                hideable: true,
                //flex: 1,
                width: 150,
                sortable: false,
                resizable: true,
                menuDisabled: true,
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
        var supportedLocales = this.getSupportedLocales(),
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
