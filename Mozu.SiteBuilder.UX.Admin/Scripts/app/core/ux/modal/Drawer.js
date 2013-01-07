/**
 * @class Taco.core.ux.modal.Drawer
 */

Ext.define('Taco.core.ux.modal.Drawer', {
    extend: 'Taco.core.ux.modal.Modal',
    alias: 'widget.drawer',

    cls: 'taco-drawer',

    easingShow: 'backOut',
    easingHide: 'backIn',
    duration: 700,
    marginTop: 74,
    contentPadding: 30,

    initComponent: function () {
        var me = this;

        me.content.layout = {
            align: 'stretch',
            type: 'vbox'
        };

        me.callParent(arguments);

        me.on({
            coverclick: {
                fn: me.hide,
                scope: me
            }
        });

        Taco.app.contentView.on({
            resize: {
                fn: me.setPosition,
                scope: me
            }
        });
    },

    show: function () {
        var me = this,
            bodyHeight;

        me.fireEvent('beforeshow');

        me.cover.show();

        bodyHeight = me.setPosition();

        me.el.setStyle({
            top: (bodyHeight / 2) + 'px'
        });

        me.el.animate(Ext.apply(me.animation, {
            listeners: {
                afteranimate: function () {
                    me.fireEvent('aftershow');
                }
            },
            easing: me.easingShow,
            top: me.marginTop + 'px'
        }));

        me.fireEvent('show');

        me.doLayout();
    },

    hide: function () {
        var me = this,
            bodyHeight = Ext.getBody().getViewSize().height;

        if (!me.fireEvent('beforehide')) {
            return;
        }

        me.cover.hide();

        me.el.animate(Ext.apply(me.animation, {
            listeners: {
                afteranimate: function () {
                    me.fireEvent('afterhide');
                }
            },
            easing: me.easingHide,
            opacity: 0,
            top: (bodyHeight / 2) + 'px'
        }));

        me.fireEvent('hide');
    },

    setPosition: function () {
        var me = this,
            bodyHeight = Ext.getBody().getViewSize().height,
            contentHeight = bodyHeight - me.marginTop - me.contentPadding;

        me.setHeight(contentHeight + me.actions.getHeight());
        me.content.setHeight(contentHeight);

        return bodyHeight;
    }
});