/**
 * @class Taco.view.navigation.PrimaryMenuSubContainer
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenuSubContainer', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.PrimaryMenuNavGroup'],
    //cls: 'taco-primary-menu-ct',

    cls: 'primary-nav-group',
    store: null,
    layout: 'vbox',
    width: '100%',
    navParent: 'main',
    
    initComponent: function () {
        if (this.store) {
            this.items = this.createNavItems();
        } else {
            console.log('store not populated in PrimaryMenuSubContainer');
        }

        this.callParent(arguments);

    },

    createNavItems: function () {
        var me = this,
            navItems = [];
        this.store.each(function (item) {
            if (item.get('navParent') === me.navParent) {
                navItems.push({
                    xtype: 'primary-menu-nav-group',
                    record: item
                });
            }
        });
        return navItems;
    },

    updateCurrentPage: function () {
        this.items.each(function (item) {
            if (item.updateCurrentPage) {
                item.updateCurrentPage();
            }
        });
    }

});