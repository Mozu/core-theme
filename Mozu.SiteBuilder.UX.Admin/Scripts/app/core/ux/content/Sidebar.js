/**
 * @class Taco.core.ux.content.Sidebar
 * Sidebar of a Taco.core.ux.content.BrowserPage.
 */

Ext.define('Taco.core.ux.content.Sidebar', {
    extend: 'Ext.container.Container',
    alias: 'widget.sidebar',

    componentCls: Taco.baseCSSPrefix + 'content-sidebar',
    layout: { type: 'fit' },
    region: 'east',
    width: 320
});