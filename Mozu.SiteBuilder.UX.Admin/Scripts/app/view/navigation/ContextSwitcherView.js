/**
 * @class Taco.view.navigation.ContextSwitcherView,
 * @author  Jimmy Sanford
 * 
 */
Ext.define('Taco.view.navigation.ContextSwitcherView', {
    extend: 'Ext.view.View',

    autoEl: {
        tag: 'ul',
        cls: Taco.baseCSSPrefix + 'context-switcher'
    },
    itemSelector: 'li.' + Taco.baseCSSPrefix + 'menu-item',
    overItemCls: Taco.baseCSSPrefix + 'menu-item-hover',
    selectedItemCls: Taco.baseCSSPrefix + 'menu-item-active',

    initComponent: function () {
        var me = this;

        this.tpl = [
            '<tpl for=".">',
                '<li class="taco-menu-item">',
                    '{text}',
                '</li>',
            '</tpl>'
        ];

        this.callParent(arguments);
    }
});