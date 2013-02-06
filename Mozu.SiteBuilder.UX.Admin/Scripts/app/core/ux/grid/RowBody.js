/**
 * @class Taco.core.ux.grid.RowBody
 * @author Jimmy Sanford
 * Extends the RowBody grid feature to allow direct injection of unwrapped tr elements.
 */

Ext.define('Taco.core.ux.grid.RowBody', {
    extend: 'Ext.grid.feature.RowBody',
    alias: 'feature.taco.rowbody',

    getRowBody: function(values) {
        // Wrapping tr, td, and div elements were removed from this XTemplate config
        // so now rowBodyTpl *must* be comprised of tr elements with record data in td elements.
        return '{rowBody}';
    }
});