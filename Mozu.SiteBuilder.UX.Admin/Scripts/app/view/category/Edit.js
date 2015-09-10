/**
 * @class Taco.view.category.Edit
 */

Ext.define('Taco.view.category.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: 'widget.categoryfulledit',
    requires: ['Taco.view.category.Form'],
    formCls: 'Taco.view.category.Form',
    saveAndCreateButtonEnabled: true,
    doCreate: function () {
        var controller = "categories"
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    },
    initComponent: function () {
        var me = this;

        this.additionalActions = [            
            {
                xtype: 'button',
                itemId: 'moreButton',
                ui: 'action',
                scale: 'medium',
                text: 'More',
                menuAlign: 'tr-br?',
                menu: {
                    plain: true,
                    shadow: false,
                    items: [{
                        itemId: 'live',
                        text: 'View Live',
                        menu: {
                            plain: true,
                            shadow: false,
                            items: []
                        }
                    }, {
                        itemId: 'preview',
                        text: 'View Staged',
                        menu: {
                            plain: true,
                            shadow: false,
                            items: []
                        }
                    }
                    ],
                    listeners: {
                        show: function (menu) {
                            var previewItem = menu.items.get('preview'),
                                liveItems = menu.items.get('live'),
                                previewMenu,
                                liveMenu,
                                previewSites = [],
                                liveSites = [];


                            var ctx = Taco.app.context.getCurrentContext();

                            if (previewItem && previewItem.menu) {
                                previewMenu = previewItem.menu;
                                liveMenu = liveItems.menu;
                                debugger;

                                
                                
                                    var sites = ctx.sites;
                                    Ext.each(sites, function (site) {
                                        if (site.isMozuRendered) {
                                            previewSites.push({
                                                itemId: site.id,
                                                text: site.name,
                                                handler: Ext.bind(me.viewInSite, me, [site, 'preview'])
                                            });

                                            liveSites.push({
                                                itemId: site.id,
                                                text: site.name,
                                                handler: Ext.bind(me.viewInSite, me, [site, 'live'])
                                            });
                                        }
                                    });
                                



                                if (!Ext.Array.equals(Ext.Array.pluck(previewSites, 'itemId'), previewMenu.items.keys)) {
                                    previewMenu.removeAll();
                                    previewMenu.add(previewSites);
                                    liveMenu.removeAll();
                                    liveMenu.add(liveSites);
                                }
                                


                                
                            }
                        },
                        scope: this
                    }
                }
            }];



        this.callParent(arguments);

    },
    viewInSite: function (site, env) {
        window.open('/_gosite/' + site.id + '?environment=' + env + '&redir=' + encodeURIComponent('/c/' + this.record.getId()));
    },
});
