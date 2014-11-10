/**
 *
 *
 */

Ext.define('Taco.overrides.grid.plugin.CellEditing', {
    override: 'Ext.grid.plugin.CellEditing',   

    init: function (view) {
        var me = this;
        me.grid = view;

        me.mon(me.grid, 'beforereconfigure', function (view, store, columns, oldStore) {            
            this.updateEditableStyles(columns)
        }, me);
        
        me.updateEditableStyles(me.grid.columns)
        
        this.callParent(arguments);
    },
    updateEditableStyles: function (columns) {
        var me = this,
            view = me.grid

        if (!columns && view) {
            columns = view.columns;
        }

        if (view && columns) {
            Ext.Array.each(columns, function (column) {
                if (column.editor) {

                    //var hasEl = column.getEl();
                    if (!column.tdCls) {
                        column.tdCls = ""
                    }

                    if (column.tdCls.indexOf("taco-editable-cell") == -1) {
                        column.tdCls += " taco-editable-cell";
                    }

                    if (column.editor.showBorder && column.tdCls.indexOf("taco-editable-cell-show-border") == -1) {
                        column.tdCls += " taco-editable-cell-show-border";
                    }
                }
            });
        }
    }
});
