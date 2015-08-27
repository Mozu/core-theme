/**
 * @class Taco.view.navigation.PrimaryMenuView
 */
Ext.define('Taco.view.navigation.PrimaryMenuView', {
    extend: 'Ext.view.View',
    requires: ['Taco.view.navigation.PrimarySubMenu'],

    autoEl: {
        tag: 'ul',
        cls: 'taco-primary-menu'
    },
    itemSelector: 'li.taco-menu-item',
    overItemCls: 'taco-menu-item-hover',
    selectedItemCls: 'taco-menu-item-active',

    initComponent: function () {
        var me = this;

        this.tpl = [
            '<tpl for=".">',
            //    '<tpl if="visible">',
                    '<li class="taco-menu-item"  style="{[(values.visible && !values.breadCrumbOnly) ? "" : "display:none" ]}" >',
                       '<a href="{address}" class="taco-menu-item-link taco-icon taco-icon-{icon}">{label}</a>',
                    '</li>',
              //  '<tpl else>',
               //      '<li class="taco-menu-item" style="display:none"> </li>',
               // '</tpl>',
            '</tpl>'
        ];

        this.menu = Ext.ComponentQuery.query('#primaryMenu').shift();
        this.subMenus = Ext.create('Ext.util.MixedCollection');

        this.callParent(arguments);

        this.on({
            viewready: this.injectSubmenus,
            itemclick: this.navigate,
            select: this.syncSelection,
            scope: this
        });
      
    },

    injectSubmenus: function () {
        this.store.each(function (record) {
            var subItems = record.items();

            if (subItems.getCount() > 0 && record.get('visible')) {
                var node = this.getNode(record),
                    submenu;

                submenu = Ext.create('Taco.view.navigation.PrimarySubMenu', {
                    store: subItems,
                    parent: record,
                    renderTo: node
                });

                this.subMenus.add(submenu);
                this.subMenus.relayEvents(submenu, ['select']);
            }
        }, this);

        this.subMenus.on({
            select: this.syncSelection,
            scope: this
        });
    },

    /**
     * Navigates to the link's destination via {@link Taco.core.StateManager}'s
     * attemptNavigate method.
     * @param  {Ext.view.View} view this
     * @param  {Ext.data.Model} record The record that belongs to this item
     * @param  {HTMLElement} The item's element
     * @param  {Number} index The item's index
     * @param  {Ext.EventObject} e The raw event object
     */
    navigate: function (view, record, item, index, e) {
        var dest = record.get('address'),
            subItem = e.getTarget('li.taco-submenu-item', 10);

        if (subItem) return false;

        e.preventDefault();
        Taco.core.StateManager.attemptNavigate(dest);
        this.menu.hideMenu();
    },

    /**
     * Manages deselection of records across all related views (menus) on selection change.
     * Also calls a method to update the breadcrumb with the new active trail.
     * @param  {Ext.selection.DataViewModel} selModel The {@link Ext.selection.DataViewModel}
     * listening for the select event
     * @param  {Ext.data.Model} record The selected record
     * @private
     */
    syncSelection: function (selModel, record) {
        //return;
        var view = selModel.view,
            menuId = view.getId();

        if (this.getId() !== menuId) {
            this.getSelectionModel().deselectAll();
            this.parentMenu.syncBreadcrumb(view.parent, view, record);
        } else {
            this.parentMenu.syncBreadcrumb(record);
        }

        this.subMenus.each(function (item) {
            if (item.getId() !== menuId) {
                item.getSelectionModel().deselectAll();
            }
        });
    },

    /**
     * Manages updating the breadcrumb after a successful navigation.
     * @param  {Ext.data.Model} record The selected record, or its parent if it has one
     * @param  {Taco.view.navigation.PrimarySubMenu} subMenu The submenu's view, if no parent
     * @param  {Ext.data.Model} subItem The selected record, if no parent
     */
    

    /**
     * Parses a URI from an href or address field into an array of its constituents.
     * @param  {String} uri An absolute or relative URI.
     * @return {String[]}
     */
    parseUri: function (uri) {
        var appPath = new RegExp(Taco.adminAppPath),
            relPath = new RegExp(Taco.adminRelPath);

        uri = uri || this.address;

        if (uri.indexOf(Taco.adminAppPath) === 0) {
            uri = uri.replace(appPath, '');
        } else if (uri.indexOf(Taco.adminRelPath) === 0) {
            uri = uri.replace(relPath, '');
        }

        uri = uri.split('/');
        return uri;
    }
});