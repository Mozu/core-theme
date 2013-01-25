/**
 * @class Taco.core.ux.tab.Panel
 */
Ext.define('Taco.core.ux.tab.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.formtabpanel',

    componentCls: Taco.baseCSSPrefix + 'form-tab-panel',
    defaults: {
        closable: true,
        header: false,
        overflowY: 'auto'
    },
    layout: {
        type: 'card'
    },

    navigation: true,

    initComponent: function () {
        var me = this,
            lbar,
            tbar;

        if (this.navigation) {
            lbar = Ext.create('Ext.Container', {
                xtype: 'component',
                width: 160,
                html: 'sidebar'
            });
        }

        tbar = Ext.create('Ext.Container', {
            xtype: 'container',
            componentCls: Taco.baseCSSPrefix + 'form-tab-bar',
            itemId: 'tabBar',
            margin: '20 0 20 160',
            items: []
        });

        this.lbar = lbar;
        this.tbar = tbar;

        this.callParent(arguments);

        this.lbar = lbar;
        this.tbar = tbar;

        this.tbar.add(this.buildTabs());
        delete tabs;
    },

    buildTabs: function () {
        var tabs = [];

        this.items.each(function (item, index) {
            tabs.push({
                xtype: 'component',
                componentCls: Taco.baseCSSPrefix + 'form-tab',
                html: item.title,
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: function () {
                            this.setActiveItem(index);
                        }
                    }
                }
            });
        }, this);

        return tabs;
    },

    setActiveItem: function (newCard) {
        var layout = this.getLayout();

        layout.setActiveItem(newCard);
    }
});