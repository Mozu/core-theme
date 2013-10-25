Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.product.Form',
        'Ext.button.Button'
    ],
    
    formCls: 'Taco.view.product.Form',

    initComponent: function () {
        var me = this;
        
        this.additionalActions = [{
            xtype: 'dirtybutton',
            itemId: 'publish',
            text: 'Publish',
            beforeItemId: 'save',
            margin: '0 0 0 10',
            hidden: !this.checkProductPublishing(),
            click: this.onClickPublish,
            scope: this,
            dirtyState: this.record.get('publishedState') !== 'Live'
        }, {
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
                    itemId: 'preview',
                    text: 'Preview in',
                    menu: {
                        plain: true,
                        shadow: false,
                        defaults: {
                            plain: true
                        },
                        items: []
                    }
                }, {
                    itemId: 'delete',
                    text: 'Delete',
                    handler: Ext.bind(me.destroyRecord, me)
                }],
                listeners: {
                    show: function (menu) {
                        var previewItem = menu.items.get('preview'),
                            previewSites = [];

                        if (previewItem && previewItem.menu) {
                            previewMenu = previewItem.menu;

                            Ext.each(me.record.getProductInSites().data.items,function (pis) {
                                var site = pis.get('site');

                                previewSites.push({
                                    itemId: site.id,
                                    text: site.name,
                                    handler: Ext.bind(me.preview, me, [pis])
                                });
                            });

                            if (!Ext.Array.equals(Ext.Array.pluck(previewSites, 'itemId'), previewMenu.items.keys)) {
                                previewMenu.removeAll();
                                previewMenu.add(previewSites);
                            }
                        }
                    },
                    scope: this
                }
            }
        }];
        
        this.formCfg = Ext.apply(this.formCfg || {}, { options: this.options });

        this.callParent(arguments);
    },

    preview: function (pis) {
        window.open('/_gosite/' + pis.getId() + '?environment=preview&redir=' + encodeURIComponent('/product/' + this.record.getId()), 'taco-preview');
    },

    onBeforeRender: function () {
        this.callParent(arguments);

        this.publishButton = this.down('dirtybutton#publish');

        this.form.on({
            savablestatechange: function (form, isSavable) {
                isSavable = this.checkSavable(isSavable) || this.record.get('publishedState') !== 'Live';

                this.publishButton.setDirty(isSavable);
            },
            scope: this
        });

        this.on({
            aftersave: function () {
                if (this.doPublishAfterSave) {
                    this.doPublish()
                }
            },
            scope: this
        });
    },

    checkProductPublishing: function () {
        var ctx = Taco.app.context.currentCtx;

        if (ctx.masterCatalog) ctx = ctx.masterCatalog;

        return ctx.productPublishingMode == 'Pending';
    },

    onClickPublish: function () {
        if (this.form.getSavableState()) {
            this.doPublishAfterSave = true;
            this.save();
        } else {
            this.doPublish();
        }
    },

    doPublish: function () {
        Taco.model.Product.publishBulk({
            data: [this.record.getId()],
            success: function () {
                this.publishButton.setDirty(false);
            },
            failure: function () {
                Taco.MessageBox.alert(
                    'Sorry!',
                    'Product change was unable to be published.'
                );
            },
            callback: function () {
                this.doPublishAfterSave = false;
            },
            scope: this
        });
    }
});