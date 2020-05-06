/**
 * @class Taco.view.navigation.SecondaryMenu
 */
Ext.define('Taco.view.navigation.SecondaryMenu', {
    extend: 'Ext.container.Container',
    alias: 'widget.secondarymenu',
    requires: ['Taco.view.navigation.GlobalSearchBox'],

    layout: {
        type: 'hbox',
        align: 'middle',
        pack: 'end',
        defaultMargins: '0 0 0 0'
    },

    cls: Taco.baseCSSPrefix + 'secondary-nav',

    initComponent: function () {

        var xIconHTML = '<span style="font-family: mozicons;position:relative;left:-4px;top:2px;font-size:14px;">&#xe903;</span>',
            searchButton,
            searchBox,
            searchButtonContent;

        searchBox = this.searchBox = Ext.create('Taco.view.navigation.GlobalSearchBox', {
            hidden: true,
            onFocus: function () {
                searchBox = this;
                searchButton.el.dom.innerHTML = xIconHTML;
                if (typeof searchButtonContent == 'undefined') {
                }
            },
            onChange: Ext.bind(function () {
                if (typeof searchButtonContent === 'undefined') {
                    searchButtonContent = searchButton.el.dom.innerHTML;
                }

                searchButton.el.dom.innerHTML = xIconHTML;
                searchButton.on('click', function () {
                    searchBox.inputEl.dom.value = '';
                    this.el.dom.innerHTML = searchButtonContent;
                });
            }),
            onBlur: Ext.bind(function () {
                if (searchBox.inputEl.dom.value == '') {
                    searchButton.el.dom.innerHTML = searchButtonContent;
                    searchButton.removeCls('is-active');
                    searchBox.hide();
                }
            }),
            onSelect: Ext.bind(function () {
                searchButton.el.dom.innerHTML = searchButtonContent;
                searchBox.hide();
            })
        });

        var tenantName = Taco.app.context.name || '[tenant]';
        var userName = Taco.user.name || Taco.user.email || '[user]';
        var splitUserName = userName.split(' ');
        var initials;
        if (splitUserName.length > 1) {
            initials = splitUserName[0][0] + splitUserName[splitUserName.length - 1][0];
        }

        this.items = [{
            xtype: 'button',
            text: 'Switch to Classic',
            cls: 'switch-button-primary',
            tooltip: 'Click here to switch to Classic Admin',
            hidden: !this.showSwitchAdminButton(),
            pressed: true,
            listeners: {
                'click': function (button, pressed) {
                    Ext.util.Cookies.set('isUnified', false);
                    Ext.util.Cookies.set('isUnifiedState', true);
                    window.location.reload(true);
                }
            }
        }, {
            xtype: 'component',
            cls: 'tenant-name',
            html: '<div class="tenant-name-container"><span>' + tenantName + '</span></div>',
        },
        {
            xtype: 'button',
            cls: 'help-button',
            ui: 'link',
            scale: 'medium',
            text: 'Help',
            hidden: Taco.siteBuilderHelperToggle !== 'on',
            handler: function () {
                window.open(Taco.neWadminHelpLink);
            }
        },
        {
            xtype: 'button',
            ui: 'link',
            scale: 'medium',
            cls: 'search-button',
            text: '',
            handler: Ext.bind(function (btn) {
                this.searchBox.show();
                searchButton = btn;
                searchButtonContent = searchButton.el.dom.innerHTML;
                this.searchBox.focus();
                searchButton.addClass('is-active');
            }, this)
        },
        this.searchBox,
        {
            xtype: 'userbutton',
            cls: 'user-initials',
            initials: initials,
            userName: userName,
            menuAlign: 'tr-br?',
            menu: {
                cls: Taco.baseCSSPrefix + 'username-menu',
                plain: true,
                shadow: false,
                minWidth: 0,
                listeners: {
                    beforerender: function() {
                        this.setWidth(this.up('button').getWidth());
                    }
                },
                items: [
                    /*
                     // deprecated old views
                     {
                     text: 'My Account',
                     handler: function() {
                     Taco.app.StateManager.attemptNavigate('account');
                     }
                     },
                     */
                    {
                        text: 'Launchpad',
                        href: '/admin/auth/launchpad'
                    }, {
                        text: 'Log Out',
                        href: '/admin/auth/logout'
                    }
                ]
            }
        }
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

        settingsRecord.items().each(function (item) {

            if (item.get('visible') === false || item.data.breadCrumbOnly) {
                return;
            }

            if (settingsMenu) {
                var subItems = item.get('items'),
                    menuItem = settingsMenu.add({
                        xtype: 'menuitem',
                        text: item.get('label'),
                        handler: function () {
                            if (item.get('address')) {
                                Taco.app.StateManager.attemptNavigate(item.get('address'));
                            }
                        }
                    }),
                    subMenu;

                //temp adding 1 laver of sublinks till nav design is finalized
                if (subItems && subItems.length) {
                    subMenu = {
                        xtype: 'menu',
                        plain: true,
                        shadow: false,
                        items: []
                    };
                    Ext.Array.each(subItems, function (subItem) {
                        if (subItem.visible !== false) {
                            subMenu.items.push(
                                {
                                    xtype: 'menuitem',
                                    text: subItem.label,
                                    handler: function () {
                                        Taco.app.StateManager.attemptNavigate(subItem.address);
                                    }
                                }
                            );
                        }
                    });
                    menuItem.setMenu(Ext.widget(subMenu));

                }
            }




    });

    },
    
    showSwitchAdminButton: function () {
        var taContext = Taco.app.context;
        return taContext.getHasLegacyAdmin();
    }
});