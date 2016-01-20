Ext.define('Taco.view.navigation.PrimaryMenuMask', {
    extend: 'Ext.Component',
    cls: 'taco-primary-menu-mask hidden',

    autoShow: false,
    hidden: true,
    border: false,
    floating: true,
    header: false,
    plain: true,
    shadow: false,
    x: 0,
    y: 0,
    width: '100%',
    height: '100%',

    initComponent: function () {
        this.callParent(arguments);
    },

    showMask: function () {
        var el = this.el || this.protoEl;
        clearTimeout(this._hideTimeout);
        this.show();
        el.removeCls('hidden');
    },

    hideMask: function () {
        var el = this.getEl(),
            me = this;

        if (!el) {
            return this.hide();
        }

        el.addCls('hidden');

        this._hideTimeout = setTimeout(function () {
            me.hide();
        }, 150);
    }
})