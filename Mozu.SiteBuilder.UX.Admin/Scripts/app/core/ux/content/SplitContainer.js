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

    config: {
        collapsedState: {
            west: false,
            east: true
        },
        east: 'Ext.panel.Panel',
        mode: 'view',
        west: 'Ext.panel.Panel'
    },

    initComponent: function () {
        this.callParent(arguments);
    },

    applyCollapsedState: function (nextState) {
        var prevState = this.getCollapsedState() || this.config.collapsedState;

        if (prevState.west !== nextState.west || prevState.east !== nextState.east) {
            nextState = Ext.apply({}, nextState, prevState);

            this.west[nextState.west ? 'collapse' : 'expand']();
            this.east[nextState.east ? 'collapse' : 'expand']();

            if (this.preventCollapsedStateChange === true) return;

            this.fireEvent('collapsedstatechange', this, nextState, prevState);
            this.onCollapsedStateChange(nextState, prevState);
        }

        return nextState;
    },

    applyEast: function () {
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
                        fn: 'onCollapseToolClick'
                    }
                }
            }
        };
    },

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
                        fn: 'onCollapseToolClick'
                    }
                }
            }
        };
    },

    onCollapseToolClick: function (e, el) {
        var direction = Ext.getCmp(el.id).ownerCt.getItemId();
        var prevState = this.getCollapsedState();

        this.setCollapsedState({
            west: (direction === 'west' && !prevState.east),
            east: (direction === 'east' && !prevState.west)
        });
    }
});
