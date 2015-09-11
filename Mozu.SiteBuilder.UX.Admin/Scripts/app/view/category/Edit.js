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

                        
                            if (me.record.phantom) {
                                liveItems.disable()
                                previewItem.disable()
                                return; 
                            }

                            var ctx = Taco.app.context.getCurrentContext();

                            if (previewItem && previewItem.menu) {
                                previewMenu = previewItem.menu;
                                liveMenu = liveItems.menu;
                                
                                    var sites = ctx.catalog.sites;
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
    viewInSite: function (site, env, noPrompt) {
        var me = this,
            url = '/_gosite/' + site.id + '?environment=' + env + '&redir=' + encodeURIComponent('/c/' + this.record.getId());

        if (noPrompt || !this.getForm().isDirty()) {
            window.open(url);
        } else {
            // prompt

            Ext.MessageBox.show({
                title: 'Unsaved Changes',
                // pushes the buttons to the right to be consistant with our dialog ux.
                rightJustifyButtons: true,
                // reverses the order of the buttons
                reverseOrder: true,
                msg: 'You have unsaved changes that will not be reflected on the site. <br/> Do you want to continue?',
                closable: false,
                buttons: Ext.Msg.YESNO,
                fn: function (val) {
                    if (val === 'yes') {
                        window.open(url);
                    }
                }
            });
            
        }
    }, 
});
