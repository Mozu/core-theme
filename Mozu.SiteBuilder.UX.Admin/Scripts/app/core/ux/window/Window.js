


Ext.define('Taco.core.ux.window.Window', {
    extend: 'Ext.window.Window',
    alias: 'widget.taco.window',
    
    modal: true,
    ghost: false,
    shadow: false,

    animationDuration: 450,

    initComponent: function () {

        if (!this.cls) this.cls = '';

        this.cls += ' taco-window';

        this.callParent(arguments);
    },

    show: function () {
        this.callParent(arguments);

        this.getEl().addCls('active');
    },

    onHide: function(animateTarget, cb, scope) {

        this.getEl().removeCls('active');

        Ext.defer(function () {
            this.getEl().hide();
            this.afterHide(cb, scope);
        }, this.animationDuration, this);
    }
});