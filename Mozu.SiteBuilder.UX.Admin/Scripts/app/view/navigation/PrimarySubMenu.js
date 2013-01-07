/**
 * @class Taco.view.navigation.PrimarySubMenu
 */
Ext.define('Taco.view.navigation.PrimarySubMenu', {
    extend: 'Ext.view.View',

    autoEl: {
        tag: 'ul',
        cls: 'taco-primary-menu-submenu'
    },
    itemSelector: 'li.taco-submenu-item',
    selectedItemCls: 'taco-submenu-item-active',

    initComponent: function () {
        var me = this;

        this.tpl = [
            '<tpl for=".">',
                '<li class="taco-submenu-item">',
                    '<a href="{address}" class="taco-submenu-item-link">{label}</a>',
                '</li>',
            '</tpl>'
        ];

        this.callParent(arguments);

        this.on({
            itemclick: this.navigate,
            scope: this
        });
    },

    /**
     * Navigates to the link's destination via {@link Taco.core.StateManager}'s
     * attemptNavigate method.
     * @param  {Ext.view.View} view this
     * @param  {Ext.data.Model} record The record that belongs to this item
     * @param  {HTMLElement} The item's element
     * @param  {Number} index The item's index
     * @param  {Ext.EventObject} e The raw event object
     */
    navigate: function (view, record, item, index, e) {
        var menu = Ext.ComponentQuery.query('#primaryMenu').shift(),
            dest = record.get('address');

        e.preventDefault();
        Taco.core.StateManager.attemptNavigate(dest);
        menu.hideMenu();
    }
});