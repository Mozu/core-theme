/**
 * @class Taco.core.ux.content.Sidebar
 * Sidebar of a Taco.core.ux.content.BrowserPage.
 */

Ext.define('Taco.core.ux.content.Sidebar', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.sidebar',

    width: 300,
    collapsible: true,
    region: 'east',

    cls: 'taco-content-sidebar',

    layout: 'fit',

});
