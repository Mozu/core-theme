/**
 * @class Taco.view.dashboard.Index
 */

Ext.define('Taco.view.dashboard.Index', {
    extend: 'Ext.Panel',
    cls: 'taco-primary-menu-tabs taco-dashboard-menu',
    defaultAlign: 'center',
    tabBar: {
        layout: {
            pack: 'center'
        }
    },
    requires: [
        'Taco.core.ux.mixins.HamburgerButton'
    ],
    bodyCls: 'taco-dashboard-body',
    initComponent: function () {
        var me = this, dashboard;

        var tpl =  [
                '<ul class="taco-dashboard-group">',
                    '<tpl for=".">',
                        '<li class="taco-dashboard-item">',
                            '<div class="taco-image-holder">',
                                '<a data-url="{[values.address]}" class="taco-dashboard-icon taco-icon-{[values.id]}"></a>',
                            '</div>',
                            '<div class="taco-content-holder">',
                                '<div class= "taco-dashboard-item-header">{[values.label]}:</div>',
                                '<div class= "taco-dashboard-item-item"><tpl for="subNav">',
                                    '<div><a data-url="{[values.address]}">{[values.label]}</a></div>',
                                '</tpl></div>',
                            '</div>',
                        '</li>',
                    '</tpl>',
                '</ul>'
            ];

        me.systemData = [];
        me.mainData = [];

        me.hamburgerButton = Ext.create('Taco.core.ux.mixins.HamburgerButton');
    
        me.mainDashboardTpl = Ext.create('Ext.Component', {
            data: me.mainData,
            tpl: tpl,
            listeners: {
                click: {
                    element: 'el',
                    delegate: '[data-url]',
                    fn: function (event, node) {
                        event.stopEvent();
                        Taco.core.StateManager.attemptNavigate(node.getAttribute('data-url'));
                    }
                }
            }
        });

        me.systemDashboardTpl = Ext.create('Ext.Component', {
            data: me.systemData,
            tpl: tpl,
            listeners: {
                click: {
                    element: 'el',
                    delegate: '[data-url]',
                    fn: function (event, node) {
                        event.stopEvent();
                        Taco.core.StateManager.attemptNavigate(node.getAttribute('data-url'));
                    }
                }
            }
        });

        this.items = [{
            xtype: 'toolbar',
            cls: 'taco-dashboard-toolbar',
            items: [
                Ext.create('Taco.core.ux.mixins.HamburgerButton'),
                '->',
                {
                    xtype: 'component',
                    html: '<a class="tab active" href="#" data-tab="main">Main</a>',
                    listeners: {
                        click: this.handleMainClick,
                        element: 'el',
                        scope: this
                    }
                }, {
                    xtype: 'component',
                    html: '<a class="tab" href="#" data-tab="system">System</a>',
                    listeners: {
                        click: this.handleSystemClick,
                        element: 'el',
                        scope: this
                    }
                },
                '->'
            ]
        }, {
            xtype: 'container',
            itemId: 'cardContainer',
            flex: 1,
            layout: 'card',
            items: [
                this.getMainPanel(),
                this.getSettingsPanel()
            ]
        }];

        me.callParent(arguments);

        me.navigationStore = Taco.core.data.StoreManager.getOrCreate('Taco.store.Navigation');

        if (this.navigationStore.hasCompletedLoading()) {
            this.renderNav();
        } else {
            this.navigationStore.addListener('load', this.renderNav, this);
        }
        this.cardContainer = this.down('#cardContainer');
    },

    handleMainClick: function (e) {
        e.preventDefault();
        this.cardContainer.getLayout().setActiveItem(0);
        this.getEl().down('[data-tab="main"]').addCls('active');
        this.getEl().down('[data-tab="system"]').removeCls('active');
    },

    handleSystemClick: function (e) {
        e.preventDefault();
        this.cardContainer.getLayout().setActiveItem(1);
        this.getEl().down('[data-tab="main"]').removeCls('active');
        this.getEl().down('[data-tab="system"]').addCls('active');
    },

    getMainPanel: function() {
        return {
            xtype: 'panel',
            tabConfig: {
                cls: 'taco-tab-heading',
                title: 'Main',
                width: 129
            },
            items: [
                this.mainDashboardTpl
            ]
        }
    },

    getSettingsPanel: function() {
        return {
            xtype: 'panel',
            tabConfig: {
                cls: 'taco-tab-heading',
                width: 129,
                title: 'System',
                margin: '0 0 0 -3',
            },
            items: [
                this.systemDashboardTpl
            ]
        }
    },

    // combines both options objects
    mergeOptions: function (obj1, obj2) {
        var obj3 = {};

        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }

        return(obj3);
    },

    renderNav:function () {
        var me = this;

        Ext.Array.forEach(me.navigationStore.data.items, function (el, index, arr) {

            var pushData = {};
            var subNav = [];

            pushData.id = el.get('id');
            pushData.label = el.get('label');
            pushData.icon = el.get('icon');
            pushData.address = el.get('address');

            Ext.Array.forEach(el.itemsStore.data.items, function (subEl, index, arr) {

                var subNavData = {};
                subNavData.label = subEl.get('label');
                subNavData.address = subEl.get('address');
                if (subEl.get('visible') && !subEl.get('breadCrumbOnly')) {
                    subNav.push(subNavData);
                }
            }, this);

            pushData.subNav = subNav;

            if (el.get('visible')) {
                if (el.get('navParent') === 'main') {
                    this.mainData.push(pushData);
                }

                else if (el.get('navParent') === 'sys') {
                    this.systemData.push(pushData);
                }
            }

        }, this);

        this.mainDashboardTpl.update(this.mainData);
        this.systemDashboardTpl.update(this.systemData);
    }
});
