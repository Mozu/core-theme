/**
 * @class Taco.view.navigation.PrimaryMenuSubContainer
 * 
 */
Ext.define('Taco.view.navigation.PrimaryMenuSubContainer', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.PrimaryMenuNavGroup'],
    //cls: 'taco-primary-menu-ct',
    store: null,
    layout: 'vbox',
    
    initComponent: function () {
        if (this.store) {
            this.items = this.createNavItems();
        } else {
            console.log('store not populated in PrimaryMenuSubContainer');
        }

        this.callParent(arguments);

    },

    createNavItems: function () {
        var navItems = [];
        this.store.each(function (item) {
            navItems.push({
                xtype: 'primary-menu-nav-group',
                record: item
            });
        });
        return navItems;
    }

});