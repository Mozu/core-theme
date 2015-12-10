/**
 * @class Taco.view.navigation.PrimarySubMenu
 */
Ext.define('Taco.view.navigation.PrimarySubMenu', {
    extend: 'Ext.view.View',

    autoEl: {
        tag: 'ul',
        cls: 'taco-primary-menu'
    },
    itemSelector: 'li.taco-primary-menu-item',
    selectedItemCls: 'taco-primay-menu-item-active',

    initComponent: function () {
        var me = this,
            selModel;

        this.tpl = [
            '<tpl for=".">',
                '<li class="taco-menu-item" style="{[(values.visible && !values.breadCrumbOnly) ? "" : "display:none" ]}">',
                    '<a href="{address}" class="taco-primary-menu-item-link">{label}</a>',
                '</li>',
            '</tpl>'
        ];

        this.callParent(arguments);

        this.listeners = {
            click: {
                element: 'el',
                fn: me.navigate,
                scope: this
            }
        };

        selModel = this.getSelectionModel();
        selModel.setSelectionMode('SINGLE');
        selModel.allowDeselect = true;
    },

    //buildFlyoutMenuConfig:function (items, menuCfg) {
    //
    //    Ext.Array.each(items, function (item) {
    //        var itemCfg = {
    //            text: item.label
    //        };
    //        menuCfg.items.add(itemCfg);
    //        if (item.address) {
    //            item.handler =function () {
    //                alert('open' + item.address);
    //            }
    //        }
    //        if (item.items && item.items.length ) {
    //            itemCfg.menu = {
    //                xtype: 'menu',
    //                items: []
    //            };
    //            this.buildFlyoutMenuConfig(item.items, itemCfg.menu);
    //        }
    //
    //    }, this);
    //},

    /**
     * Navigates to the link's destination via {@link Taco.core.StateManager}'s
     * attemptNavigate method.
     * @param  {Ext.EventObject} e The raw event object
     */
    navigate: function (e) {
        var menu = Ext.ComponentQuery.query('#primaryMenuContainer').shift();
        e.preventDefault();
        if (!e.target.hasAttribute('href')) {
            console.log('missing href');
            return;
        }
        Taco.core.StateManager.attemptNavigate(e.target.getAttribute('href'));
        if (menu) {
            menu.hideMenu();
        }
    }
});