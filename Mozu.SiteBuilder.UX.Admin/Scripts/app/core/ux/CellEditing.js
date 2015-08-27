/**
* @class Taco.core.ux.CellEditing
* @author James Zetlen
* Extends the builtin CellEditing class to use our modified CellEditor, that is smarter about how to position and size itself
*/


Ext.define('Taco.core.ux.CellEditing', {
    alias: 'plugin.tacocellediting',
    extend: 'Ext.grid.plugin.CellEditing',

    requires: ['Taco.core.ux.CellEditor'],

    getEditor: function (record, column) {
        var me = this,
                editors = me.editors,
                editorId = column.getItemId(),
                editor = editors.getByKey(editorId);

        if (editor) {
            return editor;
        } else {
            editor = column.getEditor(record);
            if (!editor) {
                return false;
            }

            // Allow them to specify a CellEditor in the Column
            if (!(editor instanceof Ext.grid.CellEditor)) {
                editor = Ext.create('Taco.core.ux.CellEditor',{
                    editorId: editorId,
                    field: editor,
                    editingPlugin: me,
                    ownerCt: me.grid
                });
            }
            editor.on({
                scope: me,
                specialkey: me.onSpecialKey,
                complete: me.onEditComplete,
                canceledit: me.cancelEdit
            });
            editors.add(editor);
            return editor;
        }
    }

});