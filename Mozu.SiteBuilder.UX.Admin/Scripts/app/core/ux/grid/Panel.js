/**
 * @class Taco.core.ux.grid.Panel
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.grid.Panel', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.core.ux.grid.Header', 'Taco.core.ux.grid.RowExpander', 'Taco.core.ux.form.SelectField'],
    alias: 'widget.taco.gridpanel',

    actionColumn: {
        xtype: 'templatecolumn',
        text: 'Actions',
        width: 150,
        tpl: '<div class="taco-actions-control"></div>'
    },

    initComponent: function () {
        var me = this;

        this.columns = this.initColumns(this.columns);

        this.callParent(arguments);
    },

    /**
     * Alter the provided columns before the grid is configured with them.
     * @return {Object[]} The modified column configurations.
     */
    initColumns: function (columns) {
        if (Ext.isEmpty(columns)) columns = [];

        if (this.actions && !Ext.Array.contains(columns, this.actionColumn)) {
            columns.push(this.actionColumn);
        }

        return columns;
    },

    /**
     * Get a list of all events fired by this grid's actions.
     * @return {String[]} Returns an array of event names.
     */
    getActionEvents: function () {
        return this.actions ? Ext.Array.pluck(this.actions, 'eventName') : [];
    }
});