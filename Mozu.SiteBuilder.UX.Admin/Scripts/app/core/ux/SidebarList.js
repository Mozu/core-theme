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
    renderTpl: '<h2 class="' + Taco.baseCSSPrefix + 'sidebarlist-title">{title}</h1>{%this.renderContent(out,values)%}',
    renderSelectors: {
        titleEl: 'h2.' + Taco.baseCSSPrefix + 'sidebarlist-title',
        listEl: 'ul.' + Taco.baseCSSPrefix + 'sidebarlist-list'
    },
    tpl: ['<ul class="' + Taco.baseCSSPrefix + 'sidebarlist-list">',
          '<tpl for=".">',
            '<li class="' + Taco.baseCSSPrefix + 'sidebarlist-list-item"><a href="javascript:;" class="' + Taco.baseCSSPrefix + 'sidebar-list-itemlink">{name}</a></li>',
          '</tpl>',
          '</ul>'
    ],
    
    initComponent: function () {
        this.callParent(arguments);

        this.store.load();
    }
});