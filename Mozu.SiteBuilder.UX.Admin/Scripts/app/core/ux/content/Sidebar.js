/**
 * @class Taco.core.ux.content.Sidebar
 * Sidebar of a Taco.core.ux.content.BrowserPage.
 */

Ext.define('Taco.core.ux.content.Sidebar', {
    extend: 'Ext.container.Container',
    alias: 'widget.sidebar',

    collapsible: true,
    componentCls: Taco.baseCSSPrefix + 'content-sidebar',
    floatable: false,
    layout: 'auto',
    shrinkWrap: false,
    // region: 'east',
    width: 300
});