/**
 * @class Taco.core.ux.grid.Panel
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.grid.Panel', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.core.ux.grid.Header', 'Taco.core.ux.grid.RowExpander', 'Taco.core.ux.form.SelectField'],
    alias: 'widget.taco.gridpanel',

    initComponent: function () {
        var me = this;

        this.columns = this.initColumns();

        this.callParent(arguments);
    },

    initColumns: function () {
        var columns = this.columns || [];

        if (this.actions) {
            columns.push({
                xtype: 'templatecolumn',
                text: 'Actions',
                width: 150,
                tpl: '<div class="taco-actions-control"></div>'
            });
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