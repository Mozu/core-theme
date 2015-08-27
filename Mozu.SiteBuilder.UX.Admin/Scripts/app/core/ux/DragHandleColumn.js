/**
* Provides a cute little drag handle on any grid. Making the thing draggable is not 
* this column's job; this is just to add the drag handle itself to the rendered column.
* 
* @private
*/
Ext.define('Taco.core.ux.DragHandleColumn', {
    extend: 'Ext.grid.column.Column',
    alias: 'widget.draghandlecolumn',
    cls: Taco.baseCSSPrefix + 'draghandlecolumn',

    tdCls: Ext.baseCSSPrefix + 'grid-cell-draghandlecolumn',

    renderer: function () {
        return '<div class="taco-tree-knurling"></div>';
    },

    defaultRenderer: function (value) {
        return value;
    }
});