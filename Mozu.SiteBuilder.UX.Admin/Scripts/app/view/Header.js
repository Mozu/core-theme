/**
 * @class Taco.view.Header
 */
Ext.define('Taco.view.Header', {
    extend: 'Ext.container.Container',
    requires: [
        'Taco.view.navigation.PrimaryMenu',
        'Taco.view.navigation.SecondaryMenu',
        'Taco.core.ux.action.Action',
        'Taco.view.navigation.ContextSwitcher'
    ],

    autoEl: { tag: 'header' },
    componentCls: Taco.baseCSSPrefix + 'viewport-header',
    height: 106,
    hideMode: 'offsets',
    layout: { type: 'anchor' },

    initComponent: function () {
        var me = this,
            primaryMenuTrigger, breadcrumb, contextSwitcherTrigger;

        primaryMenuTrigger = Ext.create('Taco.core.ux.action.Action', {
            xtype: 'action',
            text: '',
            width: 56,
            height: 51,
            cls: Taco.baseCSSPrefix + 'primary-menu-trigger',
            click: function () {
                if (me.primaryMenu.isHidden() || !me.primaryMenu.rendered) {
                    me.primaryMenu.showMenu();
                } else {
                    me.primaryMenu.hideMenu();
                }
            }
        });

        breadcrumb = Ext.create('Ext.Component', {
            flex: 1,
            cls: Taco.baseCSSPrefix + 'breadcrumb',
            tpl: [
                '<a href="{address}" class="taco-icon taco-icon-{icon}">{label}</a>',
                '<ul><tpl for="items">',
                    '<li class="taco-breadcrumb-item{[ values.selected ?"-selected": ""]}"> <a href="{address}"><span>{label}</span></a></li>',
                '</tpl></ul>'
            ]
        });

        contextSwitcherTrigger = Ext.create('Taco.view.navigation.ContextSwitcher');

        this.primaryMenu = Ext.create('Taco.view.navigation.PrimaryMenu', {
            trigger: primaryMenuTrigger,
            breadcrumb: breadcrumb
        });

        this.items = [{
            xtype: 'container',
            anchor: '100%',
            height: 55,
            cls: Taco.baseCSSPrefix + 'masthead',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [{
                xtype: 'component',
                cls: Taco.baseCSSPrefix + 'mozulogo',
                autoEl: {
                    tag: 'a',
                    href: '/admin',
                    title: ' version:[' + Taco.apiVersion + '] date:[' + Ext.Date.format(Taco.buildDate, 'Y-m-d H:i:s') + ']',
                }
            }, {
                xtype: 'secondarymenu',
                flex: 1
            }]
        }, {
            xtype: 'container',
            anchor: '100%',
            height: 51,
            cls: Taco.baseCSSPrefix + 'viewport-nav',
            autoEl: { tag: 'nav' },
            layout: {
                type: 'hbox',
                align: 'middle'
            },
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