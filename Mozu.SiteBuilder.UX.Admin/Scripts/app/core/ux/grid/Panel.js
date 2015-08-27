/**
 * @class Taco.core.ux.grid.Panel
 * @author Jimmy Sanford
 * A base class for grid panels.
 * 
 */
Ext.define('Taco.core.ux.grid.Panel', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.core.ux.grid.Header','Ext.grid.plugin.RowExpander', 'Taco.core.ux.grid.RowExpander', 'Taco.core.ux.form.SelectField', 'Taco.core.ux.grid.MenuColumn'],
    alias: 'widget.taco.gridpanel',
    rowLines: true,
    viewConfig: {
        enableTextSelection:true,
        stripeRows: false
    },
    mixins: ['Taco.core.util.GetsParentPage'],

    /**
     * @cfg {Object} columnDefaults
     * This option is a means of applying default settings to all added columns. Defaults are applied so as not
     * to override existing properties (see {@link Ext#applyIf}).
     */
    columnDefaults: {},

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

        Ext.Array.each(columns, function (col) {
            Ext.applyIf(col, this.columnDefaults);

            if (col.draggable === false) {
                col.cls = col.cls || '';
                col.cls = 'frozen ' + col.cls;
            }
        }, this);

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