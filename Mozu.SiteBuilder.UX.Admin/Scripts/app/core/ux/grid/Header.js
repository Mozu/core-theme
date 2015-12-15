/**
 * @class Taco.core.ux.grid.Header
 * @author Jimmy Sanford
 * Overrides Ext.grid.header.Container.
 * 
 */
Ext.define('Taco.core.ux.grid.Header', {
    override: 'Ext.grid.header.Container',
    requires: ['Taco.core.ux.grid.HeaderDropZone'],

    constructor: function () {
        this.callParent(arguments);
    },

    getMenuItems: function () {
        var me = this,

        menuItems = me.enableColumnHide ? me.getColumnMenu(me) : [];

        return menuItems;
    },

    getMenu: function () {
        var me = this;

        if (!me.menu) {
            me.menu = new Ext.menu.Menu({
                hideOnParentHide: false,
                header: false,
                shadow: false,
                showSeparator: false,
                items: me.getMenuItems(),
                listeners: {
                    hide: me.onMenuHide,
                    scope: me
                }
            });
            me.updateMenuDisabledState();
            me.fireEvent('menucreate', me, me.menu);
        }
        return me.menu;
    },

    onHeaderTriggerClick: function(header, e, t) {
        var me = this;

        if (header.fireEvent('headertriggerclick', me, header, e, t) !== false && me.fireEvent("headertriggerclick", me, header, e, t) !== false) {
            if (me.menu && me.menu.isVisible()) {
                me.menu.hide();
            } else {
                // inlined from Container.js showMenuBy to allow us to adjust the showBy offset
                var menu = this.getMenu(),
                    ascItem  = menu.down('#ascItem'),
                    descItem = menu.down('#descItem'),
                    sortableMth;

                // Use ownerButton as the upward link. Menus *must have no ownerCt* - they are global floaters.
                // Upward navigation is done using the up() method.
                menu.activeHeader = menu.ownerButton = header;
                header.setMenuActive(true);

                // enable or disable asc & desc menu items based on header being sortable
                sortableMth = header.sortable ? 'enable' : 'disable';
                if (ascItem) {
                    ascItem[sortableMth]();
                }
                if (descItem) {
                    descItem[sortableMth]();
                }
                menu.showBy(t, 'tr-br', [0, 5]);
            }
        }
    }
});