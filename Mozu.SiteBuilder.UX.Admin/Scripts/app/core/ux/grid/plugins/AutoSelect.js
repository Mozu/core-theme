/**
 * @class Taco.core.ux.grid.plugins.AutoSelect
 * Grid Plugin that provides automatic row selection when the view renders and after the store loads/reloads
 
  // to include this mixin in your grid class:

        plugin: [
            "autoselect"
        ],
  
 *  if you want to select a specific record in the grid when it loads you can pass the id of the record you want to select by calling sePreferredSelection();
 *  me.gridPanel.getPlugin('autoselect').setPreferredSelection ("customHammock")
 */




Ext.define('Taco.core.ux.grid.plugins.AutoSelect', {
    alias: 'plugin.autoselect',
    pluginId:"autoselect",
    extend: 'Ext.AbstractPlugin',
    mixins: {
        observable: 'Ext.util.Observable'
    },
    
    config : {
        // turns on the auto row selection behavior of the grid;  
        enableAutoSelect: true,

        // the id of the record that has preference when selecting. This is usefull after a create. you can insert the id of the newly created record in this member and it will be selected when the store reloads;
        preferredSelection: null,

        // the id of the last selected record. This is useful for reselecting a record after the store is reloaded or sorted;
        lastSelection: null
    },

    

    constructor: function () {
        var me = this;
        me.callParent(arguments);
        me.mixins.observable.constructor.call(me);
    },

    init: function (grid) {
        var me = this;
        

        // generalizing this so it can be used for dataViews as well. Note: dataView is much like grid except there is no view.
        me.grid = grid;
        // this makes it so that dataviews can act like grid.views;
        me.view = grid.view || grid;
        me.store = grid.store;
        


        if (me.enableAutoSelect) {
            me.initEvents();

            // Add some plugin methods to the grid panel to make it easier for the grid to set properties
            me.grid.setPreferredSelection = Ext.Function.bind(me.setPreferredSelection, me);
            me.grid.getPreferredSelection = Ext.Function.bind(me.getPreferredSelection, me);
            
            /*
            me.grid
            dooStuff:function (){
                var plugin= getplugin();
                if ( plugin)
                {
                    return plugin.doStuff.apply( plugin, arguments);
                }
            }

            */

        }

        me.callParent(arguments);        
    },

    // @private
    initEvents: function () {
        var me = this,
            grid = me.grid,
            view = me.view,
            store = me.store;
        
        me.mon(me.view, 'viewready', me.onAutoSelect, me);
        me.mon(me.store, 'load', me.onAutoSelect, me);
        me.mon(me.view.getSelectionModel(), 'selectionchange', me.onSelectionChange, me);
    },    

    onSelectionChange: function (selModel, selection, eOpts) {
        var me = this;
        if (selection.length) {
            me.setLastSelection(selection[selection.length - 1].getId());
        }
    },
    onAutoSelect: function () {
        var me = this;
        
        if (me.grid && me.store && me.store.getCount()) {
            var selModel = me.grid.getSelectionModel();
            // if you get to the view via the back button the selection model's store is null. Need to run this down. until  then I am disabling the keyboard support when this occurs.
            // if your getting here its because the view has listeners that were not using the mon() method and they were left when the previous view was destroyed;
            if (!selModel.store) {
                return
            };
            // order grid calls load multiple times which causes the selection to loose focus; need to clear the selection            
            selModel.deselectAll();
            var idToSelection = null,                
                preferredSelection,
                lastSelection,
                itemToSelect;

            // see if the store contains our preferred selection if one exists;
            if (me.getPreferredSelection()) {
                preferredSelection = me.store.getById(me.getPreferredSelection()) || null;
                // if the record isn't in the store we need to remove the preferredSelection value to avoid it sticking around past its initial use. example: after a search.
                if (!preferredSelection) {
                    me.setPreferredSelection(null);
                }
            }

            // if no preferred selection see if the store contains the last selection
            if (!preferredSelection) {
                lastSelection = (me.getLastSelection()) ? me.store.getById(me.getLastSelection()) : null;                
            } 
            
            itemToSelect = preferredSelection || lastSelection || 0;

            selModel.select(itemToSelect, false, false);
        }

    },

    /**
     * @private
     * AbstractComponent calls destroy on all its plugins at destroy time.
     */
    destroy: function () {
        var me = this,
            grid = me.grid;

        
                
        // Clear all listeners from all our events, clear all managed listeners we added to other Observables
        me.clearListeners();

        if (grid) {
            grid.autoSelectPlugin = me.view.autoSelectPlugin = me.grid = me.view = me.store = null;
        }
    }


});