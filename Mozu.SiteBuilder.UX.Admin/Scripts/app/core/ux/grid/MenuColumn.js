/**
 * @class Taco.core.ux.grid.MenuColumn
 * @author Jimmy Sanford
 * A column containing a single action that controls a menu.
 * 
 */
Ext.define('Taco.core.ux.grid.MenuColumn', {
    extend: 'Ext.grid.column.Template',
    alias: 'widget.taco.menucolumn',

    initComponent: function () {
        this.callParent(arguments);
    }
});