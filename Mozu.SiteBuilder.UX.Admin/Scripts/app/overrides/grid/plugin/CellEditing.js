/**
 *
 *
 */

Ext.define('Taco.overrides.grid.plugin.CellEditing', {
    override: 'Ext.grid.plugin.CellEditing',

    init: function (view) {
        if (view && view.columns) {
            Ext.Array.each(view.columns, function (column) {
                if (column.editor) {
                    
                    var hasEl = column.getEl();
                    
                    if (column.tdCls.indexOf("taco-editable-cell") == -1) {
                        column.tdCls += " taco-editable-cell";
                    }
                    
                    if (column.editor.showBorder && column.tdCls.indexOf("taco-editable-cell-show-border") == -1) {
                        column.tdCls += " taco-editable-cell-show-border";
                    }
                }
            });
        }
        this.callParent(arguments);
    }
});
