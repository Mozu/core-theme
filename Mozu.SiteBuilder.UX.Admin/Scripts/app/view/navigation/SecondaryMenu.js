/**
 * @class Taco.view.navigation.SecondaryMenu
 */
    Ext.define('Taco.view.navigation.SecondaryMenu', {
        extend: 'Ext.container.Container',
        alias: 'widget.secondarymenu',

        layout: {
            type: 'hbox',
            align: 'middle',
            pack: 'end',
            defaultMargins: { right: 21 }
        },

        initComponent: function () {
            var me = this;

            this.items = [{
                xtype: 'action',
                text: Taco.User.name || Taco.User.email || '[user]',
                click: function (item) {
                    var modal = Ext.create('Taco.core.ux.modal.Mini', {
                        target: this,
                        autoShow: true,
                        height:120,
                        items: [{
                            xtype: 'boundlist',
                            displayField:'name',
                            store: Ext.create('Ext.data.ArrayStore', {
                                fields: ['id','name','url','intraNav'],
                                data: [
                                    [0, 'My Account', '/admin/account', true],
                                    [1, 'Launch Pad', '/admin/auth/Launchpad', false],
                                    [2, 'Log Out', '/admin/auth/logout', false]
                                ]
                            }),
                            listeners: {
                                beforerender: function(view) {
                                    var item;

                                    if (Taco.app.context.isSingleSite()) {
                                        item = view.store.getById(1);
                                        if (item) {
                                            view.store.remove(item);
                                        }
                                    }
                                },
                                itemclick: function (view, record) {
                                    if ( record.get('intraNav')) {
                                        Taco.core.StateManager.attemptNavigate(record.get('url'));
                                    } else {
                                        window.location.href = record.get('url');
                                    }
                                    modal.hide();
                                }
                            }
                        }]
                    });
                },
                scope: this
            }, {
                xtype: 'action',
                text: 'Help',
                click: function () {
                    Taco.app.refreshStyle();
                }
            }, {
                xtype: 'action',
                text: 'Search',
                click: function () {
                    Taco.core.StateManager.attemptNavigate('/admin/testing/tenants');
                }
            }];

            this.callParent(arguments);
        }
    });

