/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.Attributes', {
    requires: ['Taco.store.LocalizedAttributes'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias :'widget.localizedattributesgrid',


    title: "Attributes",

    store: { type: 'Taco.store.LocalizedAttributes' },

    modelName: 'Taco.model.LocalizedAttribute',

    getStore: function() {
        return { type: 'Taco.store.LocalizedAttributes' };
    },

    // override this method and adjust the columns if you need a grid with a subset of columns;
    getColumnConfig: function() {
        var me = this,
            mc = Taco.app.context.getMasterCatalog(),
            excludeDefaultLocale = true,
            supportedLocales = (!mc) ? [] : mc.getSupportedLocales(excludeDefaultLocale),
            columns = [];

        columns = [
            {
                xtype: 'gridcolumn',
                dataIndex: 'attributeFQN',
                text: 'MC Attribute Id',
                hideable: false,
                minWidth: 300
                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                //}
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

        //// todo: move to superclass, getLocaleColumns, exclude primary? - Greg Murray on 2014-07-10 
        //for (var i = 0; i < supportedLocales.length; i++) {
        //    columns.push({
        //        xtype: 'gridcolumn',
        //        dataIndex: locale,
        //        aryIndex: i,
        //        text: locale,
        //        flex: 1,
        //        width: 150,
        //        sortable: false,
        //        resizable: false,
        //        menuDisabled: true,
        //        editor: {
        //            xtype: "textfield",
        //            showBorder: true,
        //            hideTrigger: true,
        //            emptyText: "missing",
        //            msgTarget: "qtip",
        //            selectOnFocus: true,
        //            allowBlank: true
        //        }
        //    });
        //}

        Ext.Array.each(supportedLocales, function (locale) {
            columns.push({
                xtype: 'gridcolumn',
                dataIndex: this.record.localizedContent[locale], //  "localizedContent['" + locale + "']",
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
                },
            });
        });
        return columns;
    }

});


