/**
 * @class Taco.core.ux.browser.FilterList
 * @author james_zetlen
 * Shows a list of filters for a BrowserPage.
 */

Ext.define('Taco.core.ux.browser.FilterList', {
    extend: 'Taco.core.ux.SidebarList',
    requires: ['Taco.store.ItemFilters'],

    renderData: {
        title: 'Filters'
    },

    initComponent: function () {
        var me = this;
        me.store = Taco.core.data.StoreManager.getOrCreate('Taco.store.ItemFilters');
        this.callParent(arguments);
    }

});