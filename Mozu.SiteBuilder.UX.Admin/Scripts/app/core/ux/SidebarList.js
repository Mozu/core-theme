/**
 * @class Taco.core.ux.SidebarList
 * @author james_zetlen
 * Shows a list of things in the dang sidebar, GOSH.
 */

Ext.define('Taco.core.ux.SidebarList', {
    extend: 'Ext.view.View',
    alias: 'widget.sidebarlist',
    cls: Taco.baseCSSPrefix + 'sidebarlist',

    itemSelector: '.' + Taco.baseCSSPrefix + 'sidebarlist-list-item',

    renderSelectors: {
        titleEl: 'h1.' + Taco.baseCSSPrefix + 'sidebarlist-title',
        listEl: 'ul.' + Taco.baseCSSPrefix + 'sidebarlist-list'
    },

    tpl: ['<h1 class="' + Taco.baseCSSPrefix + 'sidebarlist-title">{title}</h1>',
          '<ul class="' + Taco.baseCSSPrefix + 'sidebarlist-list">',
          '<tpl for=".">',
            '<li class="' + Taco.baseCSSPrefix + 'sidebarlist-list-item"><a href="#" class="' + Taco.baseCSSPrefix + 'sidebar-list-itemlink">{name}</a></li>',
          '</tpl>',
          '</ul>'
    ],

});