/**
 * @class Taco.core.ux.form.field.Container
 * @author Jimmy Sanford
 * Overrides Ext.form.FieldContainer.
 */
Ext.define('Taco.core.ux.form.field.Container', {
    override: 'Ext.form.FieldContainer',

    labelAlign: 'top',
    labelSeparator: '',

    constructor: function () {
        this.callParent(arguments); 
    },

    initComponent: function () {
        this.callParent(arguments);
    }
});