/**
 * @class Taco.core.ux.content.SplitContainer
 * @author Jimmy Sanford
 *
 * The base class for a two-pane, horizontally-split content container.
 * 
 * Split containers are used to combine two separate but contextually-related workflows in one view, eliminating
 * navigation between the two, which can add up to significant time savings for advanced users.
 *
 * This class extends the base class for content containers, {@link Taco.core.ux.content.Container}.
 */

Ext.define('Taco.core.ux.content.SplitContainer', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.taco-splitcontainer',

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    bodyPadding: '20 20 10',
    region: 'center',
    ui: 'page',

    stateful: true,

    stateEvents: ['childcollapse', 'childexpand'],

    /**
     * @cfg {Boolean} preventCollapsedStateChange
     * True to reject any changes to the collapsed state.
     */

    config: {
        /**
         * @cfg {String/Object/Object[]} east
         * A class name, an array of components, a single instantiated component, or a single
         * component configuration object.
         *
         * If specified as an array or MixedCollection, the east component will be a standard panel
         * and config will provide the items for the panel. In all other cases, config will be used
         * as or used to create the east component itself.
         */
        east: 'Ext.panel.Panel',

        /**
         * @cfg {Boolean} split
         * The setting controlling whether the west and east components stay expanded or alternate their
         * collapsed state. Set to `true` to keep them expanded by default.
         *
         * Defaults to `false`.
         */
        split: false,

        /**
         * @cfg {Boolean/String/Object} splitter
         * Pass as `true` to use the default splitter.
         *
         * Pass as a component instance or configuration object to use a custom splitter.
         */
        splitter: true,

        /**
         * @cfg {String/Object/Object[]} west
         * A class name, an array of components, a single instantiated component, or a single
         * component configuration object.
         *
         * If specified as an array or MixedCollection, the west component will be a standard panel
         * and config will provide the items for the panel. In all other cases, config will be used
         * as or used to create the west component itself.
         */
        west: 'Ext.panel.Panel'
    },

    initComponent: function () {


        if (!Array.isArray(this.items)) {
            this.items = [];
        }

        this.items.unshift(this.getEast());
        this.items.unshift(this.getSplitter());
        this.items.unshift(this.getWest());

        this.callParent(arguments);

        this.relayEvents(this.getWest(), ['collapse', 'expand'], 'child');
        this.relayEvents(this.getEast(), ['collapse', 'expand'], 'child');

        this.on({
            childcollapse: {
                scope: this,
                fn: 'handleChildCollapseExpand'
            },
            childexpand: {
                scope: this,
                fn: 'handleChildCollapseExpand'
            }
        });
    },

    /**
     * Auto-generated method called before setting the `east` config.
     *
     * @private
     * @param  {String/Object/Object[]} config The component or configuration object.
     * @return {Object} The instantiated component.
     */
    applyEast: function (config) {
        var defaults = this.getDefaultEastConfig();

        if (config.isComponent) {
            // if config is an instantiated component, return it directly
            return config;
        } else if (Ext.isString(config)) {
            // if config is a string, treat it as a class name
            return Ext.create(config, defaults);
        } else if (Ext.isArray(config) || config.isMixedCollection) {
            // if config is an array or collection, treat it as items
            return Ext.create('Ext.panel.Panel', Ext.apply({}, { items: config }, defaults));
        } else if (Ext.isObject(config)) {
            // otherwise treat it as config
            return Ext.widget(Ext.apply({ xtype: 'panel' }, config, defaults));
        }

        Ext.Error.raise('Invalid configuration for east view.');
    },

    /**
     * Auto-generated method called before setting the `splitter` config.
     *
     * @private
     * @param {Boolean/String/Object} splitter The component or configuration object.
     * @return {Object} The instantiated component.
     */
    applySplitter: function (splitter) {
        if (splitter === true) {
            return Ext.widget({
                xtype: 'splitter',
                cls: 'taco-splitcontainer-splitter',
                collapseTarget: 'prev',
                collapsible: false,
                width: 4
            });
        } else if (Ext.isString(splitter)) {
            return Ext.create(splitter, {});
        } else {
            return (splitter.isComponent ? splitter : Ext.widget(splitter));
        }
    },

    /**
     * Auto-generated method called before setting the `west` config.
     *
     * @private
     * @param  {String/Object/Object[]} config The component or configuration object.
     * @return {Object} The instantiated component.
     */
    applyWest: function (config) {
        var defaults = this.getDefaultWestConfig();

        if (config.isComponent) {
            // if config is an instantiated component, return it directly
            return config;
        } else if (Ext.isString(config)) {
            // if config is a string, treat it as a class name
            return Ext.create(config, defaults);
        } else if (Ext.isArray(config) || config.isMixedCollection) {
            // if config is an array or collection, treat it as items
            return Ext.create('Ext.panel.Panel', Ext.apply({}, { items: config }, defaults));
        } else if (Ext.isObject(config)) {
            // otherwise treat it as config
            return Ext.widget(Ext.apply({ xtype: 'panel' }, config, defaults));
        }

        Ext.Error.raise('Invalid configuration for west view.');
    },

    /**
     * Provides default configuration options for the east panel.
     *
     * @private
     * @return {Object} The partial configuration object.
     */
    getDefaultEastConfig: function () {
        return {
            itemId: 'east',
            title: 'East',
            layout: 'fit',
            collapseDirection: 'right',
            collapseMode: 'mini',
            header: false,
            collapsible: true,
            animCollapse: false,
            flex: 933,
            lbar: {
                xtype: 'component',
                cls: 'taco-splitcontainer-collapsetool',
                itemId: 'east-left',
                width: 13,
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: 'handleCollapseToolClick'
                    }
                }
            }
        };
    },

    /**
     * Provides default configuration options for the west panel.
     *
     * @private
     * @return {Object} The partial configuration object.
     */
    getDefaultWestConfig: function () {
        return {
            itemId: 'west',
            title: 'West',
            layout: 'fit',
            collapseDirection: 'left',
            collapseMode: 'mini',
            header: false,
            collapsible: true,
            animCollapse: false,
            flex: 303,
            rbar: {
                xtype: 'component',
                cls: 'taco-splitcontainer-collapsetool',
                itemId: 'west-right',
                width: 13,
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: 'handleCollapseToolClick'
                    }
                }
            }
        };
    },

    getState: function () {
        return this.initializeState(this.callParent());
    },

    initializeState: function(state) {
        var nextSplit = this.getSplit();
        
        (state || (state = {})).split = nextSplit;

        return state;
    },

    handleChildCollapseExpand: function (panel) {
        this.setSplit(!this.getWest().getCollapsed() && !this.getEast().getCollapsed());
    },

    /**
     * An event handler triggered by a click on the collapse tool.
     *
     * By default, this function updates the collapsed state.
     * 
     * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
     * @param {HTMLElement} targetEl The target of the event.
     */
    handleCollapseToolClick: function (e, targetEl) {
        var direction = Ext.getCmp(targetEl.id).getItemId() === 'east-left' ? 'getEast' : 'getWest';
        var opposite = direction === 'getEast' ? 'getWest' : 'getEast';

        if (this[opposite]().getCollapsed()) {
            this[opposite]().expand();
        } else {
            this[direction]().collapse();
        }
    },

    /**
     * Include CSS classes.
     */
    onBoxReady: function () {
        this.callParent(arguments);

        this.initializePanels();

        this.addCls('taco-splitcontainer');
    },

    initializePanels: function() {
        var state = this.getState(),
            panel;

        if (state) {
            if (state.split) {
                panel = this.down('panel[@collapsed]');
                if (panel) panel.expand();
            } else {
                // select west or east based on url
                panel = this.getEast();
                panel.collapse();
            }
        }
    }
});
