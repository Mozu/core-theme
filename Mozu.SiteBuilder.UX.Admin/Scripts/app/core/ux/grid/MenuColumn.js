/**
 * @class Taco.core.ux.grid.MenuColumn
 * @author Jimmy Sanford
 * A column containing a single action that controls a menu.
 * 
 */
Ext.define('Taco.core.ux.grid.MenuColumn', {
    extend: 'Ext.grid.column.Action',
    alias: 'widget.taco.menucolumn',

    draggable: false,
    hideable: false,
    resizable: false,
    sortable: false,
    text: 'Actions',
    width: 100,

    iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger',
    tooltip: 'Actions',

    menuItems: [],
    menuItemDefaults: {
        plain: true,
        padding: 10
    },

    initComponent: function () {
        this.callParent(arguments);
    },

    getMenu: function () {
        if (!this.menu) {
            this.menu = new Ext.menu.Menu({
                plain: true,
                shadow: false,
                items: this.getMenuItems()
            });
        }

        return this.menu;
    },

    getMenuItems: function () {
        var items = this.menuItems;

        Ext.Array.each(items, function (item) {
            Ext.applyIf(item, this.menuItemDefaults);
        }, this);

        return items;
    },

    handler: function(grid, rowIndex, colIndex, header, e, record, item) {
        var trigger = e.getTarget('img.' + this.iconCls, 10);

        if (this.menu && this.menu.isVisible()) {
            this.menu.hide();
        } else {
            this.showMenuBy(trigger);
        }
    },

    setMenuActive: function (isMenuOpen) {
        this.titleEl[isMenuOpen ? 'addCls' : 'removeCls'](this.headerOpenCls);
        this.triggerEl.addCls(Ext.baseCSSPrefix + 'menu');
    },

    showMenuBy: function (el) {
        var menu = this.getMenu();

        Ext.fly(el).addCls(Ext.baseCSSPrefix + 'menu');
        menu.show(el);
    }
});