/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.Attributes', {
    requires: ['Taco.store.LocalizedAttributes'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias :'widget.localizedattributesgrid',


    title: "Attributes",

    store: { type: 'Taco.store.LocalizedAttributes' },


    getStore: function() {
        return { type: 'Taco.store.LocalizedAttributes' };
    },

    config: {
        record: null
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
                    //,
                    //listeners: {
                    //    complete: function(scope, value, prevValue, eOpts) {
                    //        console.log(value);
                    //        console.log(prevValue);
                    //    }
                    //}
                },
            };
            columns.push(col);
        });
        return columns;
    }

});


