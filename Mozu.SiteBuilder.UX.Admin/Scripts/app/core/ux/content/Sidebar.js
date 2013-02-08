/**
 * @class Taco.core.ux.content.Sidebar
 * Sidebar of a Taco.core.ux.content.BrowserPage.
 */

Ext.define('Taco.core.ux.content.Sidebar', {
    extend: 'Ext.container.Container',
    alias: 'widget.sidebar',

    cls: 'taco-content-sidebar',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    autoScroll: true

});
