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
    height: 85,
    hideMode: 'offsets',
    layout: { type: 'vbox', align: 'stretch' },

    initComponent: function () {
        var me = this,
            primaryMenuTrigger, breadcrumb;

        primaryMenuTrigger = Ext.create('Taco.core.ux.action.Action', {
            xtype: 'action',
            text: '',
            width: 60,
            height: 40,
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
                '<ul>',
                '<a href="{address}" class="taco-icon taco-icon-{icon}">a{label}</a>',
                '<tpl for="items">',                    
                    '<li class="taco-breadcrumb-item{[ values.selected ?"-selected": ""]}"> <a class="{[values.items.length ? " taco-breadcrumb-menubutton" : ""]}" href="{address}" data-nav-id="{id}"><span>{label}</span></a></li>',
                '</tpl></ul>'
            ]
        });

       // contextSwitcherTrigger = Ext.create('Taco.view.navigation.ContextSwitcher');
        this.breadCrumb = breadcrumb;
        
        this.primaryMenu = Ext.create('Taco.view.navigation.PrimaryMenu', {
            trigger: primaryMenuTrigger,
            breadcrumb: breadcrumb
        });

        this.items = [{
            xtype: 'container',
            anchor: '100%',
            height: 45,
            cls: Taco.baseCSSPrefix + 'masthead',
            padding: '0 10 0 10',
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [{
                xtype: 'component',
                cls: Taco.baseCSSPrefix + 'mozulogo',
                width: 103,
                autoEl: {
                    tag: 'a',
                    href: '/admin',
                    title: ' version:[' + Taco.apiVersion + '] date:[' + Ext.Date.format(new Date(Taco.buildDate), 'Y-m-d H:i:s') + ']'
                },
                listeners: {
                    click: {
                        element: 'el', //bind to the underlying el property on the panel
                        fn: function (e) {
                            e.preventDefault();
                           // Taco.app.context.setCurrentContext(Taco.app.context);
                            Taco.core.StateManager.attemptNavigate(Taco.app.context.urlToken);
                            
                        }
                    }
                }
                }, {
                xtype: 'secondarymenu',
                flex: 1
            }]
        }, {
            xtype: 'container',
            anchor: '100%',
            height: 40,
            cls: Taco.baseCSSPrefix + 'viewport-nav',
            autoEl: { tag: 'nav' },
            layout: {
                type: 'hbox',
                align: 'middle'
            },
            items: [primaryMenuTrigger, breadcrumb]//, contextSwitcherTrigger]
        }];

        this.callParent(arguments);

        breadcrumb.on({
            click: {
                scope: this.el,
                element: 'el',
                delegate: 'a',
                fn: function (e, link) {
                    var dest,
                        id,
                        node,
                        linkEl,
                        flyoutMenu;

                    if (link) {
                        e.preventDefault();
                        linkEl = Ext.get(link);
                        id = linkEl.getAttribute('data-nav-id');
                        if (id) {
                            Ext.Array.each(breadcrumb.data.items, function (item) {
                                if (item.id == id) {
                                    node = item;
                                }
                            });
                        }

                        if (node && node.items && node.items.length > 0) {
                            flyoutMenu = {
                                xtype: 'menu',
                                items: []
                            };

                            me.buildFlyoutMenuConfig(node.items, flyoutMenu);
                            flyoutMenu = Ext.widget(flyoutMenu);
                            flyoutMenu.showBy(linkEl);
                            return;

                        }
                        dest = linkEl.getAttribute('href') || '#';
                        Taco.core.StateManager.attemptNavigate(dest);
                    }
                }
            }
        });

        Taco.app.on('user.change', function (user) {
            var cmp = me.items.getAt(0);
            if (cmp.update) {
                cmp.update(user.data);
            }
            cmp.data = user.data;
        });

        
    },
    buildFlyoutMenuConfig: function (items, menuCfg) {
        
        var me = this;
        Ext.Array.each(items, function (item) {
            var itemCfg = {
                text: item.label
            }
            menuCfg.items.push(itemCfg);
            if (item.address) {
                itemCfg.handler = function () {
                    me.launchExtensionWindow(item);
                }
            }
            if (item.items && item.items.length) {
                itemCfg.menu = {
                    xtype: 'menu',
                    items: []
                };
                me.buildFlyoutMenuConfig(item.items, itemCfg.menu);
            }

        });
    },
    launchExtensionWindow: function (extensionLink) {

        var configIframe = Ext.create('Ext.ux.IFrame', {
            height: '100%',
            src: 'about:blank'
        });

        var formHtml = "<form id='configPost' method='POST' action='" + extensionLink.address
            + "' target='" + configIframe.frameName + "'>"
       //     + "<input type=hidden name='x-vol-tenant-domain' value='" + this.record.get("tenantDomain") + "'/>"
         //   + "<input type=hidden name='x-vol-return-url' value='" + this.record.get("configReturnUrl") + "'/>"
            + "</form>";

        var configForm = {
            xtype: 'component',
            html: formHtml,
            id: 'configHiddenForm',
            hidden:true,
            listeners: {
                render: function (cmp) {
                    var fm = cmp.el.dom.firstElementChild;
                    fm.submit();
                }
            }
        };

        var modalConfigWindow = Ext.create('Taco.core.ux.window.Drawer', {
            autoShow: true,
            resizable: true,
            draggable: true,
            layout: 'fit',
            autoScroll:false,
            height: '90%',
            scale: 'large',
            actions:[],
            width: '90%',
            shadow: true,
            title:extensionLink.metaData.windowTitle,
            items: [
                configIframe,
                configForm
            ],
            //listeners: {
            //    close: function (cmp) {
            //        cmp.removeAll(true);
            //        this.record.reload();
            //    },
            //    scope: this
            //}
        });
        modalConfigWindow.center();

        this.add(modalConfigWindow);
    },
});