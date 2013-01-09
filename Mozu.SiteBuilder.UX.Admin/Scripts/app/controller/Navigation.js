/**
 * @class Taco.controller.Navigation
 * @author Travis Johnson
 * The Navigation controller
 */

Ext.define('Taco.controller.Navigation', {
    extend: 'Taco.core.Controller',
    stores: ['Navigation'],
    requires:['Taco.store.Navigation','Taco.model.Navigation'],
    views: ['navigation.PrimaryMenu', 'navigation.PrimaryMenuItem'],

    refs: [{
        ref: 'primaryMenu',
        selector: '#primaryMenu'
    }],

    init: function () {
        this.getNavigationStore().on('load', this.bindPrimaryMenu, this);

        this.callParent(arguments);

        Taco.core.StateManager.on({
            statechange: this.onStateChange,
            scope: this
        });
    },

    bindPrimaryMenu: function () {
        var pm = this.getPrimaryMenu();

        if (!pm) {
            return;
        }
        pm.bindStore(this.getNavigationStore());
    },

    onStateChange: function (appState) {
        var pm = this.getPrimaryMenu();

        if (!pm) return;

        pm.onStateChange(appState);
    }
});