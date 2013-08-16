

Ext.define('Taco.core.ux.window.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.taco.window',

    componentCls: Taco.baseCSSPrefix + 'window',
    ghost: false,
    modal: true,
    shadow: false,

    initComponent: function () {
        this.callParent(arguments);
    }
});
