/**
 * @class Taco.view.navigation.SecondaryMenu
 */
    Ext.define('Taco.view.navigation.SecondaryMenu', {
        extend: 'Ext.container.Container',
        alias: 'widget.secondarymenu',
        requires: ['Taco.core.ux.action.Button'],

        layout: {
            type: 'hbox',
            align: 'middle',
            pack: 'end',
            defaultMargins: { right: 21 }
        },

        initComponent: function () {
            var me = this;

            this.items = [{
                xtype: 'taco.button',
                autoEl: 'a',
                text: Taco.User.name || Taco.User.email || '[user]',
                menu: {
                    plain: true,
                    items: [{
                        text: 'My Account',
                        href: '/admin/account',
                        padding: '4 8',
                        plain: true
                    }, {
                        text: 'Log Out',
                        href: '/admin/auth/logout',
                        padding: '4 8',
                        plain: true
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
               
            }];

            this.callParent(arguments);
        }
    });

