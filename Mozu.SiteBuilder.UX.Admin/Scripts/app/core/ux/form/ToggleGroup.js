/**
 * @class Taco.core.ux.form.ToggleGroup
 */
Ext.define('Taco.core.ux.form.ToggleGroup', {
    extend: 'Ext.form.RadioGroup',
    alias: 'widget.togglegroup',
    cls: Taco.baseCSSPrefix + 'togglegroup',

    initComponent: function () {
        var me = this;

        this.callParent(arguments);
    }
});