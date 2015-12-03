/**
 * @class Taco.controller.Navigation
 * @author Travis Johnson
 * The Navigation controller
 */

Ext.define('Taco.controller.Navigation', {
    extend: 'Taco.core.Controller',
    stores: ['Navigation', 'Navigation2'],
    requires: [
        'Taco.store.Navigation', 
        'Taco.model.Navigation',

        // this is a prototype version that will be used by ui nav components and the keyboard navigation; Will eventually be renamed to Navigation when solid;
        'Taco.store.Navigation2',
        'Taco.model.NavigationItem2'
    ],
    
    views: ['navigation.PrimaryMenuPanel'],

    refs: [{
        ref: 'primaryMenuPanel',
        selector: '#primaryMenuPanel'
    }],

    init: function () {
        var store = this.getNavigationStore();

        if (!store.getCount()) return store.on('load', this.init, this);

        this.bindPrimaryMenu();

        this.callParent(arguments);

        Taco.core.StateManager.on({
            statechange: this.onStateChange,
            scope: this
        });
    },

    bindPrimaryMenu: function () {
        var pm = this.getPrimaryMenuPanel(),
            navStore = this.getNavigationStore();

        // if the primary menu hasnt been instantiated, preserve the navstore
        if (!pm) {
            Taco.app.NavigationStore = navStore;
            return false;
        }
        pm.bindStore(navStore);
    },

    onStateChange: function (appState) {
        var pm = this.getPrimaryMenuPanel();

        if (!pm) return;

        pm.hide();
        pm.onStateChange(appState);
    }
});