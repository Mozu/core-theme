/**
 * @class Taco.core.ux.tab.Panel
 * @author Jimmy Sanford
 * 
 */
Ext.define('Taco.core.ux.tab.Panel', {
    extend: 'Ext.panel.Panel',
    requires: ['Taco.core.ux.tab.Tab'],
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
            var tab = Ext.create('Taco.core.ux.tab.Tab', {
                card: item,
                text: item.title,
                activeCls: this.activeTabCls,
                invalidCls: this.invalidTabCls
            });
            Ext.apply(item, { tab: tab });
            tabs.push(tab);
        }, this);

        return tabs;
    },

    onCardActivate: function (card) {
        var tab = card.tab;

        card.addCls(this.activeItemCls);
        tab.addCls(tab.activeCls);

        return card;
    },

    onCardDeactivate: function (card) {
        var tab = card.tab;

        card.removeCls(this.activeItemCls);
        tab.removeCls(tab.activeCls);

        return card;
    },

    onCardValidityChange: function (form, valid) {
        var tab = form.owner.tab;

        if (valid) {
            tab.removeCls(tab.invalidCls);
        } else {
            tab.addCls(tab.invalidCls);
        }

        return valid;
    },

    setActiveItem: function (newCard) {
        var layout = this.getLayout();

        layout.setActiveItem(newCard);

        return newCard;
    }
});