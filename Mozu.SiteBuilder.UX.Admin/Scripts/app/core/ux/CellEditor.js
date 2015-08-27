/**
* @class Taco.core.ux.CellEditor
* @author James Zetlen
* Extends the builtin CellEditor class to expect a placeholder input element to position and size itself around
*/


Ext.define('Taco.core.ux.CellEditor', {
    alias: 'plugin.tacocelleditor',
    extend: 'Ext.grid.CellEditor',

    realign: function () {
        var me = this,
            boundEl = me.boundEl.down('input'),
            width = boundEl.getWidth(),
            height = boundEl.getHeight();

        me.field.setWidth(width);
        me.field.setHeight(height);
        me.alignTo(boundEl, me.alignment, Ext.Array.clone(me.offsets));
    }

});