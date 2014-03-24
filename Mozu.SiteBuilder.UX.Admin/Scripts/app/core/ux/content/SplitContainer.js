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
    extend: 'Taco.core.ux.content.Container',
    alias: 'widget.splitcontainer',

    body: {
        layout: {
            type: 'hbox',
            align: 'stretch'
        }
    },

    /**
     * @cfg {Boolean} preventCollapsedStateChange
     * True to reject any changes to the collapsed state.
     */

    config: {
        /**
         * @cfg {Object} collapsedState
         * The collapsed state of the west and east panels.
         *
         * This object should always have only two properties: `west` and `east`. Always use the
         * auto-generated setter, `setCollapsedState`, to expand or collapse the west and east
         * panels. Always set both properties at once; setting one without setting the other may
         * lead to unexpected behavior.
         */
        collapsedState: {
            west: false,
            east: true
        },

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
        Ext.apply(this.body, {
            items: [
                this.getWest(),
                this.getSplitter(),
                this.getEast()
            ]
        });

        this.callParent(arguments);
    },

    /**
     * Auto-generated method called before setting the `collapsedState` config.
     *
     * @private
     * @param  {Object} nextState The value to be set, before modifications.
     * @return {Object} The value to be set, after modifications.
     */
    applyCollapsedState: function (nextState) {
        var prevState = this.getCollapsedState() || this.config.collapsedState;

        if (prevState.west !== nextState.west || prevState.east !== nextState.east) {
            nextState = Ext.apply({}, nextState, prevState);

            this.getWest()[nextState.west ? 'collapse' : 'expand']();
            this.getEast()[nextState.east ? 'collapse' : 'expand']();

            if (this.preventCollapsedStateChange === true) return;

            this.fireEvent('collapsedstatechange', this, nextState, prevState);
            this.onCollapsedStateChange(nextState, prevState);
        }

        return nextState;
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
                collapseTarget: 'prev',
                collapsible: false,
                width: 4,
                style: {
                    backgroundColor: '#bfbfbf',
                    borderLeft: '4px solid #bfbfbf',
                    overflow: 'hidden'
                }
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
            collapsed: true,
            animCollapse: false,
            flex: 2,
            lbar: {
                xtype: 'component',
                width: 13,
                style: {
                    backgroundColor: '#e6e6e6'
                },
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
            flex: 1,
            rbar: {
                xtype: 'component',
                width: 13,
                style: {
                    backgroundColor: '#e6e6e6'
                },
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
     * An event handler triggered by a click on the collapse tool.
     *
     * By default, this function updates the collapsed state.
     * 
     * @param {Ext.EventObject} e The {@link Ext.EventObject} encapsulating the DOM event.
     * @param {HTMLElement} t The target of the event.
     */
    handleCollapseToolClick: function (e, t) {
        var direction = Ext.getCmp(t.id).ownerCt.getItemId();
        var prevState = this.getCollapsedState();

        this.setCollapsedState({
            west: (direction === 'west' && !prevState.east),
            east: (direction === 'east' && !prevState.west)
        });
    },

    /**
     * A template method for responding to a `collapsedState` change.
     */
    onCollapsedStateChange: Ext.emptyFn
});
