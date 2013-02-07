/**
 * @class Taco.core.ux.tab.Panel
 * @author Jimmy Sanford
 *
 */
Ext.define('Taco.core.ux.tab.Panel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.core.ux.tab.Tab',
        'Taco.view.product.AddSiteContainer'
    ],
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
        var availableSiteList = Ext.create('Taco.view.product.AddSiteContainer', { currentSites: Ext.Array.pluck( this.items, 'siteId' ) }),
            lbar,
            tbar;

        this.availableSiteList = availableSiteList;

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
            items: [
                {
                    xtype: 'component',
                    componentCls: Taco.baseCSSPrefix + 'form-tab',
                    cls: 'add',
                    html: 'Add Site',
                    availableSiteList: availableSiteList,
                    listeners: {
                        boxready: function () {
                            this.getEl().on({
                                click: function () {
                                    var el = Ext.get(this);
                                    if( el.hasCls('list-open') ) {
                                        availableSiteList.hide();
                                        el.removeCls('list-open');
                                    } else {
                                        availableSiteList.showBy(this, 'tr-br');
                                        el.addCls('list-open');
                                    }
                                }
                            })
                        }
                    }
                },
                availableSiteList
            ]
        });

        // Don't comment this shit out or everything will break!
        // Ask Jimmy for details...
        this.lbar = lbar;
        this.tbar = tbar;

        this.enableBubble('selectionChange'); // *** This event is fired as the result of a formTabCountChange being handled.

        this.callParent(arguments);

        this.navigationBar = lbar;
        this.tabBar = tbar;

        if (this.navigation) {
            this.updateNavigation();
        }

        this.tabBar.insert(0, this.initTabs(this.items));

        this.on('formTabCountChange', this.tabCountChange);
        this.on({
            formTabCountChange: this.tabCountChange,
            target: availableSiteList
        });
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
     * @return {Ext.container.Container} Returns the active item
     */
    setActiveItem: function (newCard) {
        var layout = this.getLayout();

        layout.setActiveItem(newCard);

        return newCard;
    },

    /**
     * Sets the Active Tab inside the tab Panel by Index
     * @param {Number} index The Container that needs to be activated
     * @return {Ext.container.Container} Returns the active item
     */
    setActiveItemAt: function (index) {
        var layout = this.getLayout();

        layout.setActiveItem(this.items.getAt(index));

        return this.getActiveItem();
    },

    /**
     * Hides the Tab in the tab bar at the selected index. If the index is not found, it will simply return.
     * @param  {Number} index The index of the tab
     * @return {Taco.core.ux.tab.Panel}       Returns itself once complete;
     */
    hideTabAt: function (index) {
        var tab;
        if (index < 0 || this.tabBar.items.length <= index) {
            return this;
        }

        tab = this.tabBar.items.getAt(index);

        if (tab.getEl()) {
            tab.getEl().addCls('hidden');
        }
        tab.hide();

        return this;
    },

    /**
     * Shows the Tab in the tab bar at the selected index. If the index is not found, it will simply return.
     * @param  {Number} index The index of the tab
     * @return {Taco.core.ux.tab.Panel}       Returns itself once complete;
     */
    showTabAt: function (index) {
        var tab;
        if (index < 0 || this.tabBar.items.length <= index) {
            return this;
        }

        tab = this.tabBar.items.getAt(index);

        tab.getEl().removeCls('hidden');
        tab.show();

        return this;
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
     * @return {Ext.Component|Boolean} The component found by the title. Returns false if not found.
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
                siteId: item.siteId,
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
     * @param {Number?} removeSiteAtId [Optional] An id number to remove from the list of associated sites
     */
    tabCountChange: function ( removeSiteAtId ) {
        // *** Get all sites in SiteCollection, reduce set to object of id:site pairs.
        var selectedSites = this.availableSiteList.getSelectedSites();

        if( removeSiteAtId ) {
            delete selectedSites[ removeSiteAtId ];
        }
        this.fireEvent('selectionChange', selectedSites);
    },

    /**
     * @private
     */
    onAdd: function (card, position) {
        var newIndex, tab;

        this.initCard(card);

        if (this.rendered && this.tabBar) {
            newIndex = this.items.getCount() - 1;

            if (newIndex >= 0) {
                tab = this.tabBar.insert(newIndex, {
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

        if (this.rendered && this.tabBar) {
            this.tabBar.remove(tab);
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

        this.navigationBar.removeAll();
        this.navigationBar.add(links);
    }
});