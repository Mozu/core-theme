/**
 * @class Taco.core.ux.grid.Panel
 * @author Jimmy Sanford
 * A base class for grid panels.
 * 
 */
Ext.define('Taco.core.ux.grid.Panel', {
    extend: 'Ext.grid.Panel',
    requires: ['Taco.core.ux.grid.Header', 'Taco.core.ux.grid.RowExpander', 'Taco.core.ux.form.SelectField', 'Ext.ux.RowExpander'],
    alias: 'widget.taco.gridpanel',

    /**
     * @cfg {Ext.grid.column.Column} actionColumn
     * A column definition object that defines the model-independent, rightmost column in the grid.
     */
    actionColumn: {
        xtype: 'templatecolumn',
        text: 'Actions',
        width: 150,
        draggable: false,
        hideable: false,
        resizable: false,
        sortable: false,
        tpl: '<div class="taco-actions-control"></div>'
    },

    /**
     * @cfg {Object} columnDefaults
     * This option is a means of applying default settings to all added columns. Defaults are applied so as not
     * to override existing properties (see {@link Ext#applyIf}).
     */
    columnDefaults: {
        draggable: true,
        hideable: true,
        resizable: false,
        sortable: true
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

        if (this.actions && this.actionColumn && !Ext.Array.contains(columns, this.actionColumn)) {
            columns.push(this.actionColumn);
        }

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