/**
 * @class Taco.core.ux.browser.FilterList
 * @author james_zetlen
 * Shows a list of filters for a BrowserPage.
 */

Ext.define('Taco.core.ux.browser.FilterList', {
    extend: 'Taco.core.ux.SidebarList',

    itemSelector: 'taco-sidebarlist-item',

    renderData: {
        title: 'Filters'
    },

});