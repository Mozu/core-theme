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
    tdCls: Taco.baseCSSPrefix + 'menu-col-cell',
    text: 'Actions',
    width: 100,

    menuItems: [],
    menuItemDefaults: { plain: true },

    getMenu: function (eventData) {
        var menuColumnHandler, recurseItemFn;

        menuColumnHandler = function (item) {
            item.menuColumnHandler(item, item.eventData);
        };

        recurseItemFn = function(item) {
            item.eventData = eventData;

            if (item.menuColumnHandler && !item.menuColumnHandlerEvent) {
                item.menuColumnHandlerEvent = true;
                item.on('click', menuColumnHandler, item.scope || item );
            }
            if (item.menu) {
                recurseItemFn(item.menu);
            }
            if (item.items) {
                item.items.each(recurseItemFn);
            }
        };

        if (!this.menu) {
            this.menu = new Ext.menu.Menu({
                plain: true,
                shadow: false,
                cls: Taco.baseCSSPrefix + 'grid-row-menu',
                items: this.getMenuItems(Ext.Array.clone(this.menuItems))
            });
        }

        if (this.onMenuShow) {
            this.onMenuShow(this.menu, eventData);
        }
        
        recurseItemFn(this.menu);

        return this.menu;
    },

    getMenuItems: function (items) {
        Ext.Array.each(items, function (item) {
            Ext.applyIf(item, this.menuItemDefaults);
        }, this);

        return items;
    },

    handler: function(grid, rowIndex, colIndex, header, e, record, item) {
        var trigger = e.getTarget('img.' + this.iconCls, 10),
            eventData = {};

        Ext.apply(eventData, {
            grid: grid.ownerCt,
            rowIndex: rowIndex,
            colIndex: colIndex,
            header: header,
            e: e,
            record: record,
            item: item
        });

        if (this.menu && this.menu.isVisible()) {
            this.menu.hide();
        } else {
            this.showMenuBy(trigger, eventData);
        }
    },

    setMenuActive: function (isMenuOpen) {
        this.titleEl[isMenuOpen ? 'addCls' : 'removeCls'](this.headerOpenCls);
        this.triggerEl.addCls(Ext.baseCSSPrefix + 'menu');
    },

    showMenuBy: function (el, eventData) {
        var menu = this.getMenu(eventData);

        Ext.fly(el).addCls(Ext.baseCSSPrefix + 'menu');
        menu.showBy(el, 'tl-tl?');
    }
});