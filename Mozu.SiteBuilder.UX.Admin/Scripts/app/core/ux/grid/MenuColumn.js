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
    menuItemDefaults: {},

    /**
     * Gets the menu, or creates it if it doesn't exist.
     * @param  {Object} eventData Modified data from the icon handler that requested the menu.
     * @param {Ext.grid.Panel} eventData.grid The owning GridPanel.
     * @param {Number} eventData.rowIndex The clicked row index.
     * @param {Number} eventData.colIndex The clicked column index.
     * @param {Object} eventData.header The clicked item (or this Column).
     * @param {Event} eventData.e The click event.
     * @param {Ext.data.Model} eventData.record The Record underlying the clicked row.
     * @param {HtmlElement} eventData.item The clicked table row.
     * @return {Ext.menu.Menu} The menu, populated with items.
     * @private
     */
    getMenu: function (eventData) {
        var menuColumnHandler, recurseItemFn,
            getHandler = function(handler) {
                if (Ext.isString(handler)) {
                    return function (item, eventData) {
                        var fnHandler, scope;
                        if (eventData.grid[handler]) {
                            scope = eventData.grid;
                        } else {
                            scope = eventData.grid.up('[' + handler + ']');
                        }
                        fnHandler = scope[handler];
                        fnHandler.apply(scope, arguments);
                    };
                }
                return handler;
            };
        
        menuColumnHandler = function (item) {
            item.menuColumnHandler(item, item.eventData);
        };

        recurseItemFn = function(item) {
            item.eventData = eventData;

            item.menuColumnHandler = getHandler(item.menuColumnHandler);
            
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

        this.onMenuShow(this.menu, eventData);
        
        recurseItemFn(this.menu);
        if (this.menu.shouldExpand == false) {
            return;
        }
        return this.menu;
    },
    

    /**
     * Template method that allows the view to adjust the menu based on the data selected. Typically to disable or hide menu options selectively based on the data record
     * @param  {Object} The menu that will display
     * @return {Object} The eventData from the selection
     * @private
     */
    onMenuShow : Ext.emptyFn,

    /**
     * Returns an array of items to populate the menu.
     * @param  {Object[]} items An array of {@link Ext.menu.Item} items.
     * @return {Array} The array of items.
     * @private
     */
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

        grid.getSelectionModel().select(record, false);
        this.showMenuBy(trigger, eventData);
    },

    /**
     * Shows the menu by the clicked icon.
     * @param  {HtmlElement} el The clicked icon.
     * @param  {Object} eventData Modified data from the icon handler that requested the menu.
     * @param {Ext.grid.Panel} eventData.grid The owning GridPanel.
     * @param {Number} eventData.rowIndex The clicked row index.
     * @param {Number} eventData.colIndex The clicked column index.
     * @param {Object} eventData.header The clicked item (or this Column).
     * @param {Event} eventData.e The click event.
     * @param {Ext.data.Model} eventData.record The Record underlying the clicked row.
     * @param {HtmlElement} eventData.item The clicked table row.
     * @private
     */
    showMenuBy: function (el, eventData) {
        var menu = this.getMenu(eventData);

        // Ext.fly(el).addCls(Ext.baseCSSPrefix + 'menu');
        menu.showBy(el, eventData.menuPosition, eventData.menuOffsets);
    }
});