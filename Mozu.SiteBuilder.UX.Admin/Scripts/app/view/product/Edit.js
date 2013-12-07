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
            //xtype: 'dirtybutton',
            xtype: "button",
            ui: "action-primary",
            scale:"medium",
            itemId: 'publish',
            text: 'Publish',
            disabled: this.record.get('publishedState') == 'Live',
            beforeItemId: 'save',
            margin: '0 0 0 10',
            hidden: !this.checkProductPublishing(),
            handler: this.onClickPublish,
            //dirtyState: this.record.get('publishedState') !== 'Live'
            scope: this
            
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

                            Ext.each(me.record.getProductInCatalogs().data.items,function (pis) {
                                var sites = pis.get('sites');
                                Ext.each(sites, function (site) {
                                    if (site.isMozuRendered) {
                                        previewSites.push({
                                            itemId: site.id,
                                            text: site.name,
                                            handler: Ext.bind(me.preview, me, [site])
                                        });
                                    }
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

    preview: function (site) {
        window.open('/_gosite/' + site.id + '?environment=preview&redir=' + encodeURIComponent('/product/' + this.record.getId()), 'taco-preview');
    },

    onBeforeRender: function () {
        var me = this;
        
        this.callParent(arguments);

        this.publishButton = this.down('button#publish');

        if (me.publishButton) {
            
            

            // if the form becomes invalid disable the publish button
            me.mon(me.form, 'validityChange', function (view, valid) {
                me.publishButton.setDisabled(!valid);
            }, me);

            // if the form gets modified, enable the publish button, but only if its valid when it becomes dirty;
            me.mon(me.form, 'dirtychange', function () {
                // note: I am not calling this.form.isValid() because that call causes the form error messages to appear;
                var isValid = !me.form.hasInvalidField() && me.form.isDirty();
                if (isValid) {
                    me.publishButton.enable();
                }
            }, me);
        }
        


        // this.form.on({
        //     savablestatechange: function (form, isSavable) {
        //         isSavable = this.checkSavable(isSavable) || this.record.get('publishedState') !== 'Live';

        //         this.publishButton.setDirty(isSavable);
        //     },
        //     scope: this
        // });

        this.on({
            aftersave: function () {
                if (this.doPublishAfterSave) {
                    this.doPublish();
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

        if (this.form.hasInvalidField()) {
            // cant publish if the form is invalid. IE it hasn't got its required fields;
            return;
        }

        
        this.publishButton.addCls('taco-button-processing');
        this.publishButton.setText('Publishing...');

        // if the form is dirty, we need to persist the changes before doing the publish
        if (this.form.isDirty()) {
            if (this.record.phantom) {
                this.suspendEvent('idchange');
                this.fireIdChangeAfterPublish = true;
            }
            this.doPublishAfterSave = true;
            this.form.save();
        } else {
            this.doPublish();
        }
    },

    doPublish: function () {
        Taco.model.Product.publishBulk({
            data: [this.record.getId()],
            success: function () {
                // this.publishButton.setDirty(false);
                this.publishButton.removeCls('taco-button-processing');
                this.publishButton.setText('Publish');
                this.publishButton.disable();
                if (this.fireIdChangeAfterPublish) {
                    this.resumeEvent('idchange');
                    this.fireEvent('idchange', this, this.record);
                }
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