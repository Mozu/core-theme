/**
 * @class Taco.core.ux.RowExpander
 * @author Jimmy Sanford
 * Overrides the RowExpander plugin to alter hardcoded colspan and rowspan attributes.
 */

Ext.define('Taco.core.ux.RowExpander', {
    override: 'Ext.ux.RowExpander',

    constructor: function () {
        this.callParent(arguments);
    }
});