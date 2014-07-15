/**
 * @class Taco.view.order.Grid
*/
Ext.define('Taco.view.settings.localization.ProductVariants', {
    requires: ['Taco.store.LocalizedProductVariants'],
    extend: 'Taco.view.settings.localization.widget.LocalizationGrid',
    alias :'widget.localizedvariantsgrid',

    title: "Product Variants",
   
    store: { type: 'Taco.store.LocalizedProductVariants' },

    // override this method and adjust the columns if your need a grid with a subset of columns;
    getColumnConfig: function () {
        var me = this;
        return [
            {
                xtype: 'gridcolumn',
                dataIndex: 'code',
                text: 'Code',
                hideable: false,

                minWidth: 300
                //renderer: function (value, metaData, record, rowIndex, colIndex, store) {
                //    return '<a href="#" class="taco-launch-editor">' + (value + '</a>');
                //}
            }, {
                xtype: 'gridcolumn',
                dataIndex: 'description',
                text: 'Description',
                flex: 1,
                width: 150

            }
        ];
    }
});


