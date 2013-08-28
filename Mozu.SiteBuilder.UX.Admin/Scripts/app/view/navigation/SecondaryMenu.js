/**
 * @class Taco.view.navigation.SecondaryMenu
 */
Ext.define('Taco.view.navigation.SecondaryMenu', {
    extend: 'Ext.container.Container',
    alias: 'widget.secondarymenu',
    requires: ['Taco.view.navigation.GlobalSearchBox'],

    cls: Taco.baseCSSPrefix + 'secondary-nav',
    layout: {
        type: 'hbox',
        align: 'middle',
        pack: 'end',
        defaultMargins: '0 10 0 0'
    },

    initComponent: function () {
        var me = this;

        this.searchBox = Ext.create('Taco.view.navigation.GlobalSearchBox', {
            hidden: true
        });

        this.items = [{
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: Taco.User.name || Taco.User.email || '[user]',
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                shadow: false,
                items: [{
                    text: 'My Account',
                    handler: function() {
                        Taco.app.StateManager.attemptNavigate('account');
                    }
                }, {
                    text: 'Launchpad',
                    href: '/admin/auth/launchpad'
                }, {
                    text: 'Log Out',
                    href: '/admin/auth/logout'
                }]
            }
        }, {
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: 'Settings',
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                shadow: false,
                itemId: 'settingsMenu',
                items: []
            }
        }, {
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: 'Help',
            handler: function () {
                Taco.app.refreshStyle();
            }
        }, {
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            text: '',
            glyph: 'XE010@mozicons',
            handler: Ext.bind(function (btn) {
                this.searchBox.show();
                btn.hide();
            }, this)
        },
            this.searchBox
        ];

        this.navStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Navigation');
        
        this.callParent(arguments);
        if (!this.navStore.isLoading) {
            this.bindSettingsStore();
        } else {
            this.navStore.on('load', this.bindSettingsStore, this);
        }
        
    },
    bindSettingsStore:function() {
        var settingsMenu = this.down('#settingsMenu'),
            settingsRecord = this.navStore.getById('settings');
        settingsRecord.items().each( function(item) {
            settingsMenu.add({
                xtype: 'menuitem',
                text: item.get('label'),
                handler: function() {
                    Taco.app.StateManager.attemptNavigate(item.get('address'));
                }
            });
        });

    }
    
});