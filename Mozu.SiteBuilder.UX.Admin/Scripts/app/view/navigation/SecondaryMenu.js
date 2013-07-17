/**
 * @class Taco.view.navigation.SecondaryMenu
 */
Ext.define('Taco.view.navigation.SecondaryMenu', {
    extend: 'Ext.container.Container',
    alias: 'widget.secondarymenu',
    requires: ['Taco.core.ux.action.Button', 'Taco.view.navigation.GlobalSearchBox'],

    cls: Taco.baseCSSPrefix + 'secondary-nav',
    layout: { type: 'auto' },

    initComponent: function () {
        var me = this;
        this.searchBox = Ext.create('Taco.view.navigation.GlobalSearchBox');
        this.items = [{
            xtype: 'taco.button',
            autoEl: 'a',
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
                    text: 'Log Out',
                    href: '/admin/auth/logout'
                }]
            }
        }, {
            xtype: 'taco.button',
            autoEl: 'a',
            text: 'Settings',
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                shadow: false,
                itemId: 'settingsMenu',
                items: []
            }
        }, {
            xtype: 'action',
            text: 'Help',
            click: function () {
                Taco.app.refreshStyle();
            }
        }, 
            this.searchBox 
           
        
        /*, {
            xtype: 'action',
            text: 'View Storefront',
            click: function () {
                window.open('/_gosite/' + Taco.app.context.getSiteId());
            },
            listeners: {
                afterrender: function() {
                    this.mon(Taco.app.context, 'contextchange', function (cfg) {
                        this[cfg.contextType === "s" ? 'show' : 'hide']();
                    }, this)
                }
            }
        }
        */
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