/**
 * @class Taco.core.ux.grid.Header
 * @author Jimmy Sanford
 * Overrides Ext.grid.header.Container.
 * 
 */
 Ext.define('Taco.core.ux.grid.Header', {
     override: 'Ext.grid.header.Container',

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
                 title: "Customize Columns",
                 minWidth: 150,
                 shadow: false,
                 showSeparator: false,
                 items: me.getMenuItems(),
                 listeners: {
                     deactivate: me.onMenuDeactivate,
                     scope: me
                 }
             });
             me.updateMenuDisabledState();
             me.fireEvent('menucreate', me, me.menu);
         }
         return me.menu;
     }
 });