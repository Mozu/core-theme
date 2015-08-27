/**
 * @class Taco.core.ux.tab.Panel
 * @author Jimmy Sanford
 *
 */
Ext.define('Taco.core.ux.tab.Panel', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Taco.core.ux.tab.Tab',
        'Taco.core.ux.tab.Picker'
    ],
    alias: 'widget.taco.tabpanel',

    componentCls: Taco.baseCSSPrefix + 'form-tab-panel',
    layout: {
        type: 'card',
        deferredRender:'true'
    },

    activeItemCls: Taco.baseCSSPrefix + 'form-card-active',
    activeTabCls: Taco.baseCSSPrefix + 'form-tab-active',
    invalidTabCls: Taco.baseCSSPrefix + 'form-tab-invalid',



    /**
     * @cfg {Boolean} navigation
     * 'true' to insert naviation on the side
     */
    navigation: false,

    initComponent: function () {
        var lbar, tbar, navStore;

        if (!this.pickerCfg) {
            this.pickerCfg = {};
        }

        if (this.navigation) {
            navStore = Ext.create('Ext.data.Store', {
                fields: ['text', 'target'],
                data: []
            });

            lbar = Ext.widget({
                xtype: 'dataview',
                componentCls: Taco.baseCSSPrefix + 'form-card-nav',
                width: 200,
                store: navStore,
                itemSelector: 'li.taco-form-card-nav-link',
                tpl: [
                    '<div class="taco-form-card-nav-body"><ul><tpl for=".">',
                        '<li class="taco-form-card-nav-link">{text}</li>',
                    '</tpl></ul></div>'
                ],
                listeners: {
                    itemclick: function (view, record, item) { this.scrollCard(record.get('target')); },
                    scope: this
                }
            });
        }

        this.addButton = Ext.widget( {
            xtype: 'component',
            componentCls: Taco.baseCSSPrefix + 'form-tab',
            cls: 'add',
            html: 'Add',
            listeners: {
                boxready: function () {
                    var addEl = this.addButton.getEl();

                    addEl.on({
                        click: function () {
                            if (this.picker.isHidden()) {
                                this.showPicker();
                            }
                        },
                        scope: this
                    });
                },
                scope: this
            }
        });

        Ext.applyIf(this.pickerCfg, {
            checkedItems: this.getCheckedItems(),
            positionNextTo: this.addButton
        });

        this.picker = Ext.create('Taco.core.ux.tab.Picker', this.pickerCfg);

        tbar = Ext.widget({
            xtype: 'container',
            componentCls: Taco.baseCSSPrefix + 'form-tab-bar',
            itemId: 'tabBar',
            margin: '0 1 20 200',
            items: [
               this.addButton,
               this.picker
            ]
        });

        this.addEvents([
            /**
             * @event selectionchange
             * Fired when the Number of Tabs selected is changed
             * @param {Taco.core.ux.tab.Panel} tabPanel The Tab Panel where the tab selection was changed
             */
            'selectionchange'
        ]);

        // pass configs for navigation and tab bar to Ext.panel.Panel's lbar and tbar configs, respectively
        // after Ext generates dockedItems, it deletes these configs automatically
        this.lbar = lbar;
        this.tbar = tbar;
        
        this.callParent(arguments);

        this.navigationBar = lbar;
        this.tabBar = tbar;

        if (this.navigation) {
            this.updateNavigation();
        }

        this.tabBar.insert(0, this.initTabs(this.items));

        //this.on('formTabCountChange', this.tabCountChange);
        this.picker.on({
            selectionchange: this.onTabSelectionChange,
            scope: this
        });
    },

    showPicker: function () {
        this.picker.show();
        this.addButton.addCls('active');
        Ext.defer(function () {
            Ext.getBody().addListener('click', this.hidePicker, this);
        }, 10, this);
    },

    hidePicker: function () {
        this.picker.hide();
        this.addButton.removeCls('active');
        Ext.getBody().removeListener('click', this.hidePicker, this);
    },

    onTabSelectionChange: function (picker, newValues, oldValues) {
        newValues = Ext.Array.pluck(newValues, 'id');
        oldValues = Ext.Array.pluck(oldValues, 'id');
        this.fireEvent('selectionchange', this, newValues, oldValues);
    },

    getCheckedItems: function () {
        return Ext.Array.filter(Ext.Array.pluck(this.items.items || this.items, 'tabPickerId'), function(value) {
            return typeof value !== 'undefined';
        });
    },

    getItemByPickerId: function (id) {
        return this.items.findBy(function (item) {return item.tabPickerId === id;});
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
        var layout = this.getLayout(), 
            oldCard = layout.getActiveItem();


        
        layout.setActiveItem(newCard);
        
        this.fireEvent('tabchange', this, newCard, oldCard);
     
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
     * @param  {String} target The id of the element to scroll to.
     * @return {Taco.core.ux.tab.Panel} Returns itself for chaining when complete.
     */
    scrollCard: function (target) {
        //hack until jimmy fixes this.
        var wrapper = Taco.app.viewPort.down('contentbody').getEl(),
            targetY = Ext.get(target).dom.offsetTop;        
       wrapper.scrollTo('top', targetY, true);
       
       return this;
        

        
        
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
                tabPickerId: item.tabPickerId,
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
        // *** Get all sites in MasterCatalog, reduce set to object of id:site pairs.
        var selectedSites = this.availableSiteList.getSelectedSites();

        if( removeSiteAtId ) {
            delete selectedSites[ removeSiteAtId ];
        }
        this.fireEvent('selectionchange', selectedSites);
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
                    tabPickerId: card.tabPickerId,
                    invalidCls: this.invalidTabCls
                });
                Ext.apply(card, { tab: tab });
            }
        }

        this.picker.buildCheckBoxes(this.getCheckedItems());
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
            if (this.tabBar.getComponent(tab)) {
                this.tabBar.remove(tab);
            } else {
                tab.destroy();
            }
        }

        this.picker.buildCheckBoxes(this.getCheckedItems());
    },

    /**
     * @private
     */
    updateNavigation: function () {
        var card = this.getActiveItem(),
            links = [];

        card.items.each(function (item) {
            if( item.title ) {
                links.push({ text: item.title, target: item.id });
            }
        }, this);


        if (this.navigation) {
            this.navigationBar.getStore().removeAll();
            this.navigationBar.getStore().add(links);
        };
            
        
    }
});