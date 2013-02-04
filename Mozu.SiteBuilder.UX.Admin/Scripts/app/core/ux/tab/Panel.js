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
    layout: { type: 'card' },

    activeItemCls: Taco.baseCSSPrefix + 'form-card-active',
    activeTabCls: Taco.baseCSSPrefix + 'form-tab-active',
    invalidTabCls: Taco.baseCSSPrefix + 'form-tab-invalid',

    /**
     * @cfg {Boolean} navigation
     * 'true' to insert naviation on the side
     */
    navigation: false,

    initComponent: function () {
        var me = this,
            lbar,
            tbar;

        if (this.navigation) {
            lbar = Ext.create('Ext.Container', {
                componentCls: Taco.baseCSSPrefix + 'form-card-nav',
                width: 160,
                items: []
            });
        }

        tbar = Ext.create('Ext.Container', {
            xtype: 'container',
            componentCls: Taco.baseCSSPrefix + 'form-tab-bar',
            itemId: 'tabBar',
            margin: '20 0 20 160',
            items: [{
                xtype: 'component',
                componentCls: Taco.baseCSSPrefix + 'form-tab',
                cls: 'add',
                html: 'Add Site'
            }]
        });

        // Don't comment this shit out or everything will break!
        // Ask Jimmy for details...
        this.lbar = lbar;
        this.tbar = tbar;

        this.callParent(arguments);

        // Don't comment this shit out or everything will break!
        // Ask Jimmy for details...
        this.lbar = lbar;
        this.tbar = tbar;

        if (this.navigation) {
            this.updateNavigation();
        }

        this.tbar.insert(0, this.initTabs(this.items));
    },

    /**
     * Gets the Active Tab inside the tab Panel
     * @return {Ext.container.Container} The Active Container or Panel inside the tab
     */
    getActiveItem: function () {
        var layout = this.getLayout();

        return layout.getActiveItem();
    },

    /**
     * Sets the Active Tab inside the tab Panel
     * @param {Ext.container.Container} newCard The Container that needs to be activated
     * @return {Ext.container.Container} Returns the 
     */
    setActiveItem: function (newCard) {
        var layout = this.getLayout();

        layout.setActiveItem(newCard);

        return newCard;
    },

    /**
     * Scrolls to the card top of the given item
     * @param  {Ext.container.Container} card The container or panel to scroll
     * @param  {Ext.Component} item The given Component inside the container to scroll to.
     * @return {Taco.core.ux.tab.panel}      Returns itself for chaining when complete.
     */
    scrollCard: function (card, item) {
        var cardEl = card.body || card.getEl(),
            itemEl = item.getEl();

        cardEl.scrollBy(0, itemEl.getY() - cardEl.getY(), true);
    },
    
    /**
     * Returns the tab by title
     * @param  {String} title Title of the component in the tab
     * @return {Ext.Component}       The component found by the title. Returns undefined if not found.
     */
    getTab: function (title) {
        var result;

        this.items.each(function (item) {
            if (item.title === title) {
                result = item;
                return false;
            }
        });

        return result;
    },

    /**
     * Returns the tab by index
     * @param  {Number} index The index of the Tab to find
     * @return {Ext.Component}       The component found by the index. Returns undefined if not found.
     */
    getTabAt: function (index) {
        return this.items.getAt(index);
    },

    /**
     * @private
     */
    initCard: function (card) {
        // defaults are unreliable, so this method is used instead

        Ext.apply(card, {
            closable: true,
            header: false
        });
        card.setOverflowXY('hidden', 'auto');
        card.on({
            activate: this.onCardActivate,
            deactivate: this.onCardDeactivate,
            validitychange: this.onCardValidityChange,
            scope: this
        });
    },

    /**
     * @private
     */
    initTabs: function (items) {
        var tabs = [];

        items.each(function (item, index) {
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

    /**
     * @private
     */
    onAdd: function (card, position) {
        var newIndex, tab;

        this.initCard(card);

        if (this.rendered && this.tbar) {
            newIndex = this.items.getCount() - 1;

            if (newIndex >= 0) {
                tab = this.tbar.insert(newIndex, {
                    xtype: 'formtab',
                    card: card,
                    text: card.title,
                    activeCls: this.activeTabCls,
                    invalidCls: this.invalidTabCls
                });
                Ext.apply(card, { tab: tab });
            }
        }
    },

    /**
     * @private
     */
    onCardActivate: function (card) {
        var tab = card.tab;

        card.addCls(this.activeItemCls);
        tab.addCls(tab.activeCls);
        this.updateNavigation();

        return card;
    },

    /**
     * @private
     */
    onCardDeactivate: function (card) {
        var tab = card.tab;

        card.removeCls(this.activeItemCls);
        tab.removeCls(tab.activeCls);

        return card;
    },

    /**
     * @private
     */
    onCardValidityChange: function (form, valid) {
        var tab = form.owner.tab;

        if (valid) {
            tab.removeCls(tab.invalidCls);
        } else {
            tab.addCls(tab.invalidCls);
        }

        return valid;
    },

    /**
     * @private
     */
    onRemove: function (card, autoDestroy) {
        var tab = card.tab;

        if (this.rendered && this.tbar) {
            this.tbar.remove(tab);
        }
    },

    /**
     * @private
     */
    updateNavigation: function () {
        var card = this.getActiveItem(),
            links = [];

        card.items.each(function (item) {
            links.push({
                xtype: 'component',
                componentCls: Taco.baseCSSPrefix + 'form-card-nav-link',
                target: item,
                html: item.title,
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: function () { this.scrollCard(card, item); }
                    }
                }
            });
        }, this);

        this.lbar.removeAll();
        this.lbar.add(links);
    }
});