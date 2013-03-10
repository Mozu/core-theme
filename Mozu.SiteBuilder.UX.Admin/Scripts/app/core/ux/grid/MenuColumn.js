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

    actions: [],

    menuCls: Taco.baseCSSPrefix + 'grid-row-menu',

    constructor: function (config) {
        var cfg = Ext.apply({}, config),
            iconCls = cfg.iconCls || this.iconCls,
            actions = cfg.actions || this.actions,
            menuCls = cfg.menuCls || this.menuCls;

        Ext.applyIf(config, {
            items: [{
                iconCls: iconCls,
                handler: function (view, rowIndex, colIndex, item, e, record) {
                    var trigger = e.getTarget('img.' + item.iconCls, 10),
                        children = record.get('productInSites');

                    Ext.Array.each(actions, function (action, index, allActions) {
                        var subMenu = undefined,
                            subItems = [];

                        if (!Ext.isEmpty(children) && action.multiSite === true) {
                            Ext.Array.each(children, function (child) {
                                subItems.push({
                                    plain: false,
                                    text: child.siteId.toString(),
                                    eventName: action.eventName,
                                    handler: function (item, e) { view.fireEvent(item.eventName, view, record, item); }
                                });
                            });
                        }

                        if (!Ext.isEmpty(subItems)) {
                            subMenu = {
                                plain: true,
                                cls: menuCls,
                                items: subItems
                            };
                        }

                        Ext.apply(action, {
                            plain: false,
                            menu: subMenu,
                            handler: function (item, e) { view.fireEvent(item.eventName, view, record, item); }
                        });
                    }, this);

                    Ext.destroy(this.actionMenu);
                    this.actionMenu = Ext.create('Ext.menu.Menu', {
                        plain: true,
                        cls: menuCls,
                        items: actions
                    }).showBy(trigger);
                }
            }]
        });

        this.callParent(arguments);
    },
});