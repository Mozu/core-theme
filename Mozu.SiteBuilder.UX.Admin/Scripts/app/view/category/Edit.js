/**
 * @class Taco.view.category.Edit
 */

Ext.define('Taco.view.category.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    alias: 'widget.categoryfulledit',
    cls: 'category-header',
    requires: ['Taco.view.category.Form'],
    formCls: 'Taco.view.category.Form',
    saveAndCreateButtonEnabled: true,
    extraButtonEnabled: false,
    enableSearchBarInHeader: false,
    parentTitleCfg: {
        title: 'Categories',
        controller: 'categories'
    },
    doCreate: function () {
        var controller = "categories",
            url;

        url = (this.record.get("categoryType") != "Static") ? controller + '/createdynamic' : controller + '/create';

        Taco.app.StateManager.attemptNavigate(url);
    },
    initComponent: function () {
        var me = this;

        /**
        * Used to reset the expression schema filter
        *  Added as part of page rule display.
        */
        Taco.filter = Taco.view.filter.Schema;
        Taco.filter.init();

        this.moreButtonCfg = {
            menu: {
                cls: 'taco-ellipsis-split-button',
                plain: true,
                shadow: false,
                items: [
                {
                    disabled: me.record.data.isHidden,
                    itemId: 'live',
                    text: 'View Live',
                        menu: {
                        cls: 'taco-ellipsis-split-button',
                        plain: true,
                        shadow: false,
                        items: []
                    }
                }, {
                    disabled: me.record.data.isHidden,
                    itemId: 'preview',
                    text: 'View Staged',
                    menu: {
                        cls: 'taco-ellipsis-split-button',
                        plain: true,
                        shadow: false,
                        items: []
                    }
                },
                {
                    disabled: me.record.phantom,
                    text: 'Duplicate',
                    requiredBehaviors: {
                        model: 'Taco.model.Category',
                        behavior: 'create'
                        },
                        handler: function () {

                            var record = me.record,
                                metaData = {
                                    record: record,
                                    id: record.getId()
                                };

                            Taco.app.StateManager.attemptNavigate('categories/duplicate/' + record.getId(), metaData);
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
                            liveItems.disable();
                            previewItem.disable();
                            return;
                        }

                        var ctx = Taco.app.context.getCurrentContext();

                        if (previewItem && previewItem.menu) {
                            previewMenu = previewItem.menu;
                            liveMenu = liveItems.menu;

                            var sites = (ctx.sites) ? ctx.sites : (ctx.catalog && ctx.catalog.sites) ? ctx.catalog.sites : [];

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
        };

        this.callParent(arguments);
    },
    viewInSite: function (site, env, noPrompt) {
        var url = '/_gosite/' + site.id + '?environment=' + env + '&redir=' + encodeURIComponent('/c/' + this.record.getId());

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
    onBeforeRender: function () {
        var me = this;
        this.callParent(arguments);

        me.mon(me.form, 'dirtychange', function (form, isDirty) {
            Taco.core.StateManager.setDirtyState(isDirty);
            me.requiresSave = isDirty;
        }, me);
    }
});
