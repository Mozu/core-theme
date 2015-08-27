/**
 * @class Taco.core.ux.form.FlexBox
 */
Ext.define('Taco.core.ux.form.FlexBox', {
    extend: 'Ext.container.Container',
   
    alias: ['widget.formflexbox', 'layout.formflexbox'],
    componentCls: Taco.baseCSSPrefix + 'form-flexbox',

    layout: 'auto',
    justify: true,

    initComponent: function () {
        var me = this;

        if (!this.justify) {
            this.addCls(Taco.baseCSSPrefix + 'form-flexbox-start');
        }

        this.callParent(arguments);
    }
});