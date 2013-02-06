/**
 * @class Taco.core.ux.grid.Panel
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.grid.Panel', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.taco.gridpanel',

    initComponent: function () {
        var me = this;

        this.callParent(arguments);
    }
});