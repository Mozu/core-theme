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

    constructor: function (config) {
        var cfg = Ext.apply({}, config),
            iconCls = cfg.iconCls || this.iconCls,
            actions = cfg.actions || [],
            subActions = [];

        Ext.applyIf(config, {
            items: [{
                iconCls: iconCls,
                handler: function (view, rowIndex, colIndex, item, e, record) {
                    var trigger = e.getTarget('img.' + item.iconCls, 10);

                    Ext.Array.each(actions, function (action, index, allActions) {
                        Ext.apply(action, {
                            handler: function (item, e) { view.fireEvent(item.eventName, view, record, item); }
                        });

                        if (action.multiSite) {
                            var subitems = record.get('productInSites');
                            Ext.Array.each(subitems, function (subitem) {
                                Ext.Array.include(allActions, {
                                    itemId: action.itemId + subitem.siteId.toString(),
                                    text: subitem.siteId.toString(),
                                    eventName: action.eventName,
                                    handler: function (item, e) { view.fireEvent(item.eventName, view, record, item); }
                                });
                            });
                        }
                    }, this);

                    if (this.actionMenu) {
                        this.actionMenu.destroy();
                        delete this.actionMenu;
                    }

                    this.actionMenu = Ext.create('Ext.menu.Menu', {
                        items: actions
                    }).showBy(trigger);
                }
            }]
        });

        this.callParent(arguments);
    },
});