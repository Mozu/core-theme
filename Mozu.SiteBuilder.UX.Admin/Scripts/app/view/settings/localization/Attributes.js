/**
 * @class Taco.view.settings.localization.Attributes
*/
Ext.define('Taco.view.settings.localization.Attributes', {
    requires: ['Taco.store.LocalizedAttributes', 'Taco.view.settings.localization.AdvancedSearchForm'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias :'widget.localizedattributesgrid',

    title: "Attributes",

    store: { type: 'Taco.store.LocalizedAttributes' },


    getStore: function() {
        return { type: 'Taco.store.LocalizedAttributes' };
    },

    // override this method and adjust the columns if you need a grid with a subset of columns;
    getColumnConfig: function() {
        var me = this,
            mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'attributeFQN',
                text: 'MC Attribute Id',
                hideable: false,
                minWidth: 300
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'adminName',
                text: 'MC Attribute Admin Name',
                flex: 1,
                width: 150
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'name',
                text: 'Attribute Name (English)',
                flex: 1,
                width: 150
            }
        ];

        // todo: take into account search filter to only show language? - Greg Murray on 2014-07-14 


        // todo: move to superclass, getLocaleColumns, exclude primary? - Greg Murray on 2014-07-10 

        Ext.Array.each(supportedLocales, function (locale) {
            var col = {
                xtype: 'gridcolumn',
                dataIndex: locale + '_name',
                text: locale,
                flex: 1,
                width: 150,
                sortable: false,
                resizable: false,
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

    getAdvancedSearchConfig: function() {
        var mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            quickFilters = [
                            [{ hasRecord: false }, 'Missing Translation'],
                            [{ hasRecord: true}, 'Has Translation'],
                            [{}, 'All Records']
                        ];

            Ext.Array.each(supportedLocales, function(loc) {
                quickFilters.push([{ localeNotExists: loc }, 'Missing ' + loc]);
                quickFilters.push([{ localeExists: loc }, 'Has ' + loc]);
            });

        return {
            advancedFormCls: 'Taco.view.settings.localization.AdvancedSearchForm',

            quickFilterData: quickFilters
        };
    }

});


