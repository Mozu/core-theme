/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.Attributes', {
    requires:['Taco.store.LocalizedAttributes'],
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
        var me = this;
        return [
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
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'spanish',
                text: 'Spanish',
                flex: 1,
                width: 150,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                editor: {
                    // defaults to textfield if no xtype is supplied
                    xtype: "textfield",
                    showBorder: true,
                    hideTrigger: true,
                    emptyText: "missing",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: true
                },
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'french',
                text: 'French',
                flex: 1,
                width: 150,
                sortable: false,
                resizable: false,
                menuDisabled: true,
                editor: {
                    // defaults to textfield if no xtype is supplied
                    xtype: "textfield",
                    showBorder: true,
                    hideTrigger: true,
                    emptyText: "missing",
                    msgTarget: "qtip",
                    selectOnFocus: true,
                    allowBlank: true
                },
            }
        ];
    }

});


