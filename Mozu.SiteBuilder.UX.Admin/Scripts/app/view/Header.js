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
            text: 'menu',
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
            cls: Taco.baseCSSPrefix + 'breadcrumb',
            tpl: [
                '<a href="{address}" class="taco-icon taco-icon-{icon}">{label}</a>',
                '<ul><tpl for="items">',
                    '<li class="taco-breadcrumb-item{[ values.selected ?"-selected": ""]}"> <a href="{address}"><span>{label}</span></a></li>',
                '</tpl></ul>'
            ]
        });

        contextSwitcherTrigger = Ext.create('Taco.view.navigation.ContextSwitcher');
        // contextSwitcherTrigger = Ext.create('Ext.form.field.ComboBox', {
        //     width: 250,
        //     cls: Taco.baseCSSPrefix + 'context-switcher',
        //     editable: false,
        //     typeAhead: false,
        //     triggerAction: 'all',
        //     queryMode: 'local',
        //     valueField: 'urlToken',
        //     store: Taco.app.context.getStore(),
        //     value: Taco.app.context.getCurrent().urlToken,
        //     listConfig: {
        //         shadow: false,
        //         cls: Taco.baseCSSPrefix + 'context-switcher-menu'
        //     },
        //     displayTpl: '<tpl for=".">{name}</tpl>',
        //     tpl: '<tpl for="."><div class="x-boundlist-item context-type-{contextType}">{name}</div></tpl>'
            
        // });

        this.primaryMenu = Ext.create('Taco.view.navigation.PrimaryMenu', {
            trigger: primaryMenuTrigger,
            breadcrumb: breadcrumb
        });

        this.items = [{
            xtype: 'container',
            anchor: '100%',
            height: 55,
            cls: Taco.baseCSSPrefix + 'masthead',
            layout: { type: 'auto' },
            items: [{
                xtype: 'component',
                cls: Taco.baseCSSPrefix + 'mozulogo',
                autoEl: {
                    tag: 'a',
                    href: '/admin',
                    title: ' version:[' + Taco.apiVersion + '] date:[' + Ext.Date.format(Taco.buildDate, 'Y-m-d H:i:s') + ']',
                }
            }, {
                xtype: 'secondarymenu'
            }]
        }, {
            xtype: 'container',
            anchor: '100%',
            height: 51,
            cls: Taco.baseCSSPrefix + 'viewport-nav',
            autoEl: { tag: 'nav' },
            layout: { type: 'auto' },
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