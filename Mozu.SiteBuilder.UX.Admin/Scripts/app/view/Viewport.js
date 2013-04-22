/**
 * @class Taco.view.Viewport
 */
Ext.define('Taco.view.Viewport', {
    extend: 'Ext.container.Viewport',
    requires: ['Taco.core.ContentView'],

    id: 'primaryViewPort',
    layout: 'fit',

    initComponent: function () {
        this.contentView = Ext.create('Taco.core.ContentView', { id: 'contentView', region: 'center' });

        this.items = [{
            xtype: 'container',
            itemId: 'shell',
            componentCls: 'taco-shell',
            overflowX: 'hidden',
            overflowY: 'auto',
            items: [
                Ext.create('Taco.view.Header', { region: 'north' }),
                this.contentView
            ]
        }];
        
        this.callParent(arguments);

        this.on({
            afterrender: this.attachScrollEvents,
            scope: this,
            single: true
        });
    },

    attachScrollEvents: function () {
        var el = this.items.get('shell').getEl();

        el.on({
            scroll: this.onViewportScroll,
            scope: this
        });
    },

    onViewportScroll: function (e, t) {
        var isScrolled = this.isScrolled;

        if (!isScrolled && t.scrollTop > 106) {
            isScrolled = true;
            Ext.fly(t).addCls('taco-shell-scrolled');
        } else if (isScrolled && t.scrollTop <= 106) {
            isScrolled = false;
            Ext.fly(t).removeCls('taco-shell-scrolled');
        }
        this.isScrolled = isScrolled;
    }
});