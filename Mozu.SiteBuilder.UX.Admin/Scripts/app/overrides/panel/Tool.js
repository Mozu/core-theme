Ext.define('Taco.overrides.panel.Tool', {
    override: 'Ext.panel.Tool',
    requires: ['Ext.menu.Manager'],

    height: 16,
    width: 16,

    menuAlign: 'tr-br?',

    renderTpl: ['<span role="presentation" id="{id}-toolEl" src="{blank}" class="{baseCls}-img {baseCls}-{type}' + '{childElCls}" role="presentation"></span>'],

    initComponent: function () {
        var me = this;

        me.callParent(arguments);

        if (me.menu) {
            me.menu = Ext.menu.Manager.get(me.menu);

            me.mon(me.menu, {
                scope: me,
                hide: me.onMenuHide,
                show: me.onMenuShow
            });
        }
    },

    beforeDestroy: function () {
        var me = this;

        if (me.menu) {
            Ext.destroy(me.menu);
        }

        me.callParent();
    },

    collapseMenuIf: function (e) {
        var me = this;

        if (!me.isDestroyed) {
            me.hideMenu();
        }
    },

    hasVisibleMenu: function () {
        var menu = this.menu;

        return menu && menu.rendered && menu.isVisible();
    },

    hideMenu: function () {
        if (this.hasVisibleMenu()) {
            this.menu.hide();
        }

        return this;
    },

    maybeShowMenu: function () {
        var me = this;

        if (me.menu && !me.hasVisibleMenu()) {
            me.showMenu();
        }
    },

    onClick: function(e, target) {
        var me = this;

        if (me.disabled) {
            return false;
        }

        //remove the pressed + over class
        me.el.removeCls(me.toolPressedCls);
        me.el.removeCls(me.toolOverCls);

        if (me.stopEvent !== false) {
            e.stopEvent();
        }

        me.maybeShowMenu();

        if (me.handler) {
            Ext.callback(me.handler, me.scope || me, [e, target, me.ownerCt, me]);
        } else if (me.callback) {
            Ext.callback(me.callback, me.scope || me, [me.toolOwner || me.ownerCt, me, e]);
        }
        me.fireEvent('click', me, e);
        return true;
    },

    onMenuHide: function (e) {
        var me = this;

        Ext.getDoc().un('mousewheel', me.collapseMenuIf, me);
        
        me.fireEvent('menuhide', me, me.menu);
    },

    onMenuShow: function (e) {
        var me = this;

        me.mon(Ext.getDoc(), {
            mousewheel: me.collapseMenuIf,
            scope: me
        });

        me.fireEvent('menushow', me, me.menu);
    },

    showMenu: function () {
        var me = this,
            menu = me.menu;
    
        if (me.rendered) {
            if (menu.isVisible()) {
                menu.hide();
            }
        }

        menu.showBy(me.el, me.menuAlign);

        return me;
    }
});
