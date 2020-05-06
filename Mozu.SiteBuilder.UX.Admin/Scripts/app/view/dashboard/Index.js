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
        'Taco.core.ux.mixins.HamburgerButton',
        'Taco.core.ux.card.Tab',
        'Taco.core.ux.card.Toolbar'
    ],
    bodyCls: 'taco-dashboard-body',
    layout: 'auto',
    autoScroll: true,
    initComponent: function () {
        var me = this, dashboard;

        var tpl =  [
                '<ul class="taco-dashboard-group">',
                    '<tpl for=".">',
                        '<li class="taco-dashboard-item">',
                            '<div class="taco-dashboard-item-box">',
                                '<div class="taco-image-holder">',
                                '<tpl if="values.address == \'/admin?quotes\' || values.address == \'/admin?locationGroups\' || values.id == \'fulfiller\' || values.id == \'orderRouting\'">',    
                                    '<a href="{[values.address]}" class="taco-dashboard-icon taco-icon-{[values.id]}"></a>',
                                    '<tpl else>',
                                    '<a data-url="{[values.address]}" class="taco-dashboard-icon taco-icon-{[values.id]}"></a>',
                                    '</tpl>',
                                '</div>',
                                '<div class="taco-content-holder">',
                                    '<div class= "taco-dashboard-item-header">{[values.label]}:</div>',
                                    '<div class= "taco-dashboard-item-item"><tpl for="subNav">',
                                    '<tpl if="values.address == \'/admin?quotes\' || values.address == \'/admin?locationGroups\' || values.label == \'Fulfiller\' || values.label == \'Order Routing\'">',    
                                    '<div><a href="{[values.address]}">{[values.label]}</a></div>',
                                    '<tpl else>',
                                     '<div><a data-url="{[values.address]}">{[values.label]}</a></div>',
                                    '</tpl>',
                                    '</tpl></div>',
                                '</div>',
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
            xtype: 'panel',
            dockedItems: [{
                xtype: 'taco-cardtabtoolbar',
                cls: 'taco-dashboard-toolbar',
                items: [
                    Ext.create('Taco.core.ux.mixins.HamburgerButton'),
                    '->',
                    {
                        title: 'Main'
                    }, {
                        title: 'System'
                    },
                    '->'
                ]
            }],
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

            //Added check when there are no submenu items for example home,help on hamburgur menu.
            if (el.data.items.length > 0) {
                Ext.Array.forEach(el.itemsStore.data.items, function (subEl, index, arr) {

                    var subNavData = {};
                    subNavData.label = subEl.get('label');
                    subNavData.address = subEl.get('address');
                    if (subEl.get('visible') && !subEl.get('breadCrumbOnly')) {
                        subNav.push(subNavData);
                    }
                }, this);
            }

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
