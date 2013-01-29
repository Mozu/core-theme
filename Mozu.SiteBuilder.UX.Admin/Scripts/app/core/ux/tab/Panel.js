/**
 * @class Taco.core.ux.tab.Panel
 */
Ext.define('Taco.core.ux.tab.Panel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.formtabpanel',

    componentCls: Taco.baseCSSPrefix + 'form-tab-panel',
    defaults: {
        bubbleEvents: ['activate', 'deactivate', 'validitychange'],
        closable: true,
        header: false,
        overflowY: 'auto'
    },
    layout: {
        type: 'card'
    },

    activeItemCls: Taco.baseCSSPrefix + 'form-card-active',
    activeTabCls: Taco.baseCSSPrefix + 'form-tab-active',
    invalidTabCls: Taco.baseCSSPrefix + 'form-tab-invalid',
    navigation: false,

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

        if (this.navigation) {
            this.lbar.add(this.initNavigation());
        }

        this.tbar.add(this.initTabs());

        this.on({
            activate: this.onCardActivate,
            deactivate: this.onCardDeactivate,
            validitychange: this.onCardValidityChange,
            scope: this
        });
    },

    initNavigation: function () {
        var links = [];



        return links;
    },

    initTabs: function () {
        var tabs = [];

        this.items.each(function (item, index) {
            var tab = Ext.create('Ext.Component', {
                xtype: 'component',
                componentCls: Taco.baseCSSPrefix + 'form-tab',
                card: item,
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
            Ext.apply(item, { tab: tab });
            tabs.push(tab);
        }, this);

        return tabs;
    },

    onCardActivate: function (card) {
        card.addCls(this.activeItemCls);
        card.tab.addCls(this.activeTabCls);

        return card;
    },

    onCardDeactivate: function (card) {
        card.removeCls(this.activeItemCls);
        card.tab.removeCls(this.activeTabCls);

        return card;
    },

    onCardValidityChange: function (form, valid) {
        var panel = form.owner;

        if (valid) {
            panel.tab.removeCls(this.invalidTabCls);
        } else {
            panel.tab.addCls(this.invalidTabCls);
        }

        return valid;
    },

    setActiveItem: function (newCard) {
        var layout = this.getLayout();

        layout.setActiveItem(newCard);

        return newCard;
    }
});