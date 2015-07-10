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

Ext.define('Taco.core.ux.content.TripleSplitContainer', {
    extend: 'Taco.core.ux.content.SplitContainer',
    alias: 'widget.taco-triplesplitcontainer',


    /**
     * @cfg {Boolean} preventCollapsedStateChange
     * True to reject any changes to the collapsed state.
     */

    config: {
        east2: 'Ext.panel.Panel',

        splitter2: true
    },

    initComponent: function () {
        Ext.apply(this, {
            items: [
                this.getSplitter2(),
                this.getEast2()
            ]
        });

        this.callParent(arguments);
    },

    applyEast2: function (config) {
        var defaults = this.getDefaultEast2Config();

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
    applySplitter2: function (splitter) {
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

    getDefaultEastConfig: function () {
        return Ext.apply(this.callParent(), {
            flex: 33,
            rbar: {
                xtype: 'component',
                cls: 'taco-splitcontainer-collapsetool',
                itemId: 'east-right',
                width: 13,
                listeners: {
                    click: {
                        scope: this,
                        element: 'el',
                        fn: 'handleCollapseToolClick'
                    }
                }
            }
        });
    },

    getDefaultWestConfig: function () {
        return Ext.apply(this.callParent(), {
            flex: 33
        });
    },

    getDefaultEast2Config: function () {
        return {
            itemId: 'east2',
            title: 'East2',
            layout: 'fit',
            collapseDirection: 'right',
            collapseMode: 'mini',
            header: false,
            collapsible: true,
            animCollapse: false,
            flex: 33,
            lbar: {
                xtype: 'component',
                cls: 'taco-splitcontainer-collapsetool',
                itemId: 'east2-left',
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
        var itemId = Ext.getCmp(targetEl.id).getItemId();

        console.log('state', this.getState());

        switch(itemId) {
            case 'west-right':
                if (this.getEast().getCollapsed()) {
                    this.getEast().expand();
                } else {
                    this.getWest().collapse();    
                }
                return;

            case 'east-left':
                if (this.getWest().getCollapsed()) {
                    this.getWest().expand();
                } else {
                    this.getEast().collapse();
                    this.getEast2().collapse();
                }
                return;

            case 'east-right':
                if (this.getEast2().getCollapsed()) {
                    this.getEast2().expand();
                } else {
                    this.getEast().collapse();
                    this.getWest().collapse();
                }
                return;

            case 'east2-left':
                if (this.getEast().getCollapsed()) {
                    this.getEast().expand();
                } else {
                    this.getEast2().collapse();    
                }

                return;
        }
    },

    initializePanels: function () {
        var state = this.getState();

        console.log('State', state);
    }
});
