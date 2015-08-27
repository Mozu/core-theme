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
                minWidth: 150,
                shadow: false,
                showSeparator: false,
                items: me.getMenuItems()
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
                me.showMenuBy(t, header);
            }
        }
    }
});