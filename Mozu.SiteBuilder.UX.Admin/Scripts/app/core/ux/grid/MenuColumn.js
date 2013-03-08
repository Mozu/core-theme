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

    getMenu: function (clickEvent) {
        if (this.menu) {
            this.updateMenuItems(clickEvent);
        } else {
            this.menu = new Ext.menu.Menu({
                plain: true,
                shadow: false,
                cls: Taco.baseCSSPrefix + 'grid-row-menu',
                items: this.getMenuItems(clickEvent)
            });
        }

        return this.menu;
    },

    getMenuItems: function (clickEvent) {
        var items = this.menuItems,
            data = clickEvent.record.getData();

        Ext.Array.each(items, function (item) {
            Ext.applyIf(item, this.menuItemDefaults);
            Ext.applyIf(item, {
                data: data,
                tpl: item.text || '',
                renderTpl: '{%this.renderContent(out,values)%}',
                handler: this.menuItemHandler,
                clickEvent: clickEvent
            });
        }, this);

        return items;
    },

    handler: function(grid, rowIndex, colIndex, header, e, record, item) {
        var trigger = e.getTarget('img.' + this.iconCls, 10),
            clickEvent = {};

        Ext.apply(clickEvent, {
            grid: grid.ownerCt,
            record: record,
            item: item,
            index: rowIndex,
            e: e
        });

        if (this.menu && this.menu.isVisible()) {
            this.menu.hide();
        } else {
            this.showMenuBy(trigger, clickEvent);
        }
    },

    menuItemHandler: function (item, e) {
        var grid = item.clickEvent.grid;

        console.log(grid);
        grid.fireEvent(item.eventName, item.clickEvent);
    },

    setMenuActive: function (isMenuOpen) {
        this.titleEl[isMenuOpen ? 'addCls' : 'removeCls'](this.headerOpenCls);
        this.triggerEl.addCls(Ext.baseCSSPrefix + 'menu');
    },

    showMenuBy: function (el, clickEvent) {
        var menu = this.getMenu(clickEvent);

        Ext.fly(el).addCls(Ext.baseCSSPrefix + 'menu');
        menu.showBy(el);
    },

    updateMenuItems: function (clickEvent) {
        var items = this.menu.items,
            data = clickEvent.record.getData();

        items.each(function (item) {
            item.update(data);
        }, this);
    }
});