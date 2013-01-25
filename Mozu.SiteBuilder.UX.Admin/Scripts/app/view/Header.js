/**
 * @class Taco.view.Header
 */
Ext.define('Taco.view.Header', {
    extend: 'Ext.container.Container',
    requires: ['Taco.view.navigation.PrimaryMenu', 'Taco.view.navigation.ContextSwitcher', 'Taco.view.navigation.SecondaryMenu', 'Taco.core.ux.action.Action'],

    autoEl: {
        tag: 'header',
        cls: Taco.baseCSSPrefix + 'viewport-header'
    },
    layout: 'auto',

    initComponent: function () {
        var me = this,
            primaryMenuTrigger, breadcrumb, contextSwitcherTrigger;

        primaryMenuTrigger = Ext.create('Taco.core.ux.action.Action', {
            xtype: 'action',
            text: 'menu',
            cls: Taco.baseCSSPrefix + 'primary-menu-trigger',
            width: 56,
            height: 35,
            click: function () {
                if (me.primaryMenu.isHidden() || !me.primaryMenu.rendered) {
                    me.primaryMenu.showMenu();
                } else {
                    me.primaryMenu.hideMenu();
                }
            }
        });

        breadcrumb = Ext.create('Ext.Component', {
            autoEl: {
                tag: 'div',
                cls: Taco.baseCSSPrefix + 'breadcrumb'
            },
            flex: 1,
            tpl: [
                '<a href="{address}" class="taco-icon taco-icon-{icon}">{label}</a>',
                '<ul><tpl for="items">',
                    '<li><a href="{address}">{label}</a></li>',
                '</tpl></ul>'
            ]
        });

        contextSwitcherTrigger = Ext.create('Taco.core.ux.form.SelectField', {
            name: 'context',
            fieldLabel: 'Context',
            hideLabel: true,
            mode: 'local',
            valueField: 'storedValue',
            displayField: 'displayValue',
            store: Ext.create('Ext.data.ArrayStore', {
                fields: [{
                    name: 'storedValue',
                    type: 'int'
                }, {
                    name: 'displayValue',
                    type: 'string'
                }],
                data: [
                    [0, 'Tenant'],
                    [1, 'SiteCollection0'],
                    [2, 'Site0']
                ]
            }),
            value: 0
        });

        this.primaryMenu = Ext.create('Taco.view.navigation.PrimaryMenu', {
            trigger: primaryMenuTrigger,
            breadcrumb: breadcrumb
        });

        this.items = [{
            xtype: 'container',
            autoEl: {
                tag: 'div',
                cls: Taco.baseCSSPrefix + 'masthead'
            },
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            height: 49,
            items: [{
                xtype: 'component',
                autoEl: {
                    tag: 'a',
                    href: '/admin',
                    title: Taco.siteInfo.Name + ' siteId:[' + Taco.siteInfo.Id + '] tenantId:[' + Taco.siteInfo.TenantId + '] version:[' + Taco.apiVersion + '] date:[' + Ext.Date.format(Taco.buildDate, 'Y-m-d H:i:s') + ']',
                    cls: Taco.baseCSSPrefix + 'mozulogo'
                }
            }, {
                xtype: 'secondarymenu',
                flex: 1
            }]
        }, {
            xtype: 'container',
            autoEl: {
                tag: 'nav',
                cls: Taco.baseCSSPrefix + 'viewport-nav'
            },
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            height: 35,
            items: [primaryMenuTrigger, breadcrumb, contextSwitcherTrigger]
        }];

        this.callParent(arguments);

        breadcrumb.on({
            click: {
                scope: this.el,
                element: 'el',
                fn: function (e, t) {
                    var link = e.getTarget('a'),
                        dest;

                    if (link) {
                        e.preventDefault();
                        dest = Ext.fly(link).getAttribute('href') || '#';
                        Taco.core.StateManager.attemptNavigate(dest);
                    }
                }
            }
        });

        Taco.app.eventbus.on('user.change', function (user) {
            var cmp = me.items.getAt(0);
            if (cmp.update) {
                cmp.update(user.data);
            }
            cmp.data = user.data;
        });
    }
});