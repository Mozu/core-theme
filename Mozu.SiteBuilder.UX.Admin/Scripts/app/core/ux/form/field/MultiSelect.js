/**
 * @class Taco.core.ux.form.field.MultiSelect
 * @author Jimmy Sanford
 * Overrides Ext.ux.form.MultiSelect.
 */
Ext.define('Taco.core.ux.form.field.MultiSelect', {
    extend: 'Ext.ux.form.MultiSelect',
    alias: 'widget.taco.field.multiselect',

    initComponent: function () {
        this.callParent(arguments);
    },

    deselect: function (id) {
        this.setValue(Ext.Array.remove(this.getValue(), id));
    }
});