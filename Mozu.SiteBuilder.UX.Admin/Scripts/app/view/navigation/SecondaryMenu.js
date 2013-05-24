/**
 * @class Taco.view.navigation.SecondaryMenu
 */
Ext.define('Taco.view.navigation.SecondaryMenu', {
    extend: 'Ext.container.Container',
    alias: 'widget.secondarymenu',
    requires: ['Taco.core.ux.action.Button'],

    cls: Taco.baseCSSPrefix + 'secondary-nav',
    layout: { type: 'auto' },

    initComponent: function () {
        var me = this;

        this.items = [{
            xtype: 'taco.button',
            autoEl: 'a',
            text: Taco.User.name || Taco.User.email || '[user]',
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
            xtype: 'action',
            text: 'Help',
            click: function () {
                Taco.app.refreshStyle();
            }
        }, {
            xtype: 'action',
            text: 'Search'
           
        }, {
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
        }];

        this.callParent(arguments);
    }
});