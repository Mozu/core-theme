


Ext.define('Taco.core.ux.window.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.taco.window',
    
    modal: true,
    resize: false,
    ghost: false,

    initComponent: function () {

        if (!this.cls) this.cls = '';

        this.cls += ' taco-window';

        this.callParent(arguments);

    }
});