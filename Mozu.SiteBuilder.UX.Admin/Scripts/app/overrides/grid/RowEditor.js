/*
 // Temporary bug fix in extjs 4.2.1;
 // see: http://www.sencha.com/forum/showthread.php?264529-4.2.1-Ext.grid.RowEditor-onFieldChanged()-No-Longer-Called
 // check for fix in when we upgrade to next version of extjs
*/
Ext.define('Taco.overrides.grid.RowEditor', {
    override: 'Ext.grid.RowEditor',
    addFieldsForColumn: function(column, initial) {

        var me = this,
            i,
            length, field;


        if (Ext.isArray(column)) {
            for (i = 0, length = column.length; i < length; i++) {
                me.addFieldsForColumn(column[i], initial);
            }
            return;
        }


        if (column.getEditor) {


            field = column.getEditor(null, {
                xtype: 'displayfield',
                getModelData: function() {
                    return null;
                }
            });
            if (column.align === 'right') {
                field.fieldStyle = 'text-align:right';
            }


            if (column.xtype === 'actioncolumn') {
                field.fieldCls += ' ' + Ext.baseCSSPrefix + 'form-action-col-field';
            }


            if (me.isVisible() && me.context) {
                if (field.is('displayfield')) {
                    me.renderColumnData(field, me.context.record, column);
                } else {
                    field.suspendEvents();
                    field.setValue(me.context.record.get(column.dataIndex));
                    field.resumeEvents();
                }
            }
            if (column.hidden) {
                me.onColumnHide(column);
            } else if (column.rendered && !initial) {
                me.onColumnShow(column);
            }

            // -- start edit
            this.mon(field, 'change', this.onFieldChange, this);
            // -- end edit
        }
    }
}
);