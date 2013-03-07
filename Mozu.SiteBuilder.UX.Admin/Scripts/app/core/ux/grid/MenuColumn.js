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
    iconCls: Taco.baseCSSPrefix + 'grid-row-menu-trigger',
    resizable: false,
    sortable: false,
    text: 'Actions',
    width: 100,

    menuItems: [],
    menuItemDefaults: {
        plain: true,
        padding: 6
    },

    initComponent: function () {
        this.callParent(arguments);
    },

    getMenu: function (record) {
        if (this.menu) {
            this.menu.record = record;
            this.updateMenuItems(record);
        } else {
            this.menu = new Ext.menu.Menu({
                record: record,
                plain: true,
                shadow: false,
                cls: Taco.baseCSSPrefix + 'grid-row-menu',
                items: this.getMenuItems(record)
            });
        }

        return this.menu;
    },

    getMenuItems: function (record) {
        var items = this.menuItems,
            data = record.getData();

        Ext.Array.each(items, function (item) {
            Ext.applyIf(item, this.menuItemDefaults);
            Ext.applyIf(item, {
                data: data,
                tpl: item.text || '',
                renderTpl: '{%this.renderContent(out,values)%}',
                handler: this.menuItemHandler,
                scope: this
            });
        }, this);

        return items;
    },

    handler: function(grid, rowIndex, colIndex, header, e, record, item) {
        var trigger = e.getTarget('img.' + this.iconCls, 10);

        if (this.menu && this.menu.isVisible()) {
            this.menu.hide();
        } else {
            this.showMenuBy(trigger, record);
        }
    },

    menuItemHandler: function (item, e) {
        var menu = item.ownerCt,
            eventName = item.eventName,
            record = menu.record,
            grid = this.up('gridpanel');

        grid.fireEvent(eventName, grid, record);
    },

    setMenuActive: function (isMenuOpen) {
        this.titleEl[isMenuOpen ? 'addCls' : 'removeCls'](this.headerOpenCls);
        this.triggerEl.addCls(Ext.baseCSSPrefix + 'menu');
    },

    showMenuBy: function (el, record) {
        var menu = this.getMenu(record);

        Ext.fly(el).addCls(Ext.baseCSSPrefix + 'menu');
        menu.showBy(el);
    },

    updateMenuItems: function (record) {
        var items = this.menu.items,
            data = record.getData();

        items.each(function (item) {
            item.update(data);
        }, this);
    }
});