/**
 * @class Taco.view.report.SidebarList
 * @author ojas_patel
 * Shows report list along with report criteria
 */

Ext.define('Taco.view.report.SidebarList', {
    extend: 'Ext.view.View',
    alias: 'widget.sidebarlist2',
    cls: Taco.baseCSSPrefix + 'sidebarlist',

    itemSelector: '.' + Taco.baseCSSPrefix + 'sidebarlist-list-item',
    renderData: {
        title: 'Report Type'
    },
    renderTpl: '<h2 class="' + Taco.baseCSSPrefix + 'sidebarlist-title">{title}</h1>{%this.renderContent(out,values)%}',
    renderSelectors: {
        titleEl: 'h2.' + Taco.baseCSSPrefix + 'sidebarlist-title',
        listEl: 'ul.' + Taco.baseCSSPrefix + 'sidebarlist-list'
    },
    tpl: ['<ul class="' + Taco.baseCSSPrefix + 'sidebarlist-list">',
          '<tpl for=".">',
            '<li class="' + Taco.baseCSSPrefix + 'sidebarlist-list-item"><a href="javascript:;" class="' + Taco.baseCSSPrefix + 'sidebar-list-itemlink">{key}: {name}<!--{categoryName}--></a></li>',
          '</tpl>',
          '</ul>'
    ],
    initComponent: function () {
        this.callParent(arguments);
    }
});