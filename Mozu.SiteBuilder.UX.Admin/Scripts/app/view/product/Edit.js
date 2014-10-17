Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.product.Form',
        'Taco.view.product.widget.productCode.Modal',
        'Ext.button.Button'
    ],
    
    statics: {
        sizes: {},
        factory: function (cfg, callback, scope) {
            cfg = Ext.apply(cfg,
            {
                productTypeStore: Taco.core.data.StoreManager.getOrCreate('Taco.store.ProductTypes')
            });

            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    callback.call(scope || this, Ext.create('Taco.view.product.Edit', cfg));
                },
                tasks: [
                    {
                        storeToLoad: cfg.productTypeStore
                    }
                ],
                autoExecute: true,
            });
        }
    },

    alias: "widget.taco-product-editor",
    
    formCls: 'Taco.view.product.Form',

    // state property of the form that gets set to true whtn the form and its child panels get dirtied. 
    // note that isDirty seems to always return true. Which necessitated this work around;  The manageInventory button in the inventory subform checks this value before navigating to the inventory view.
    // Todo: figure out why the isDirty is always true and generalize the isDirty Prompt for reuse rathaer than part of the inventory subform.
    requiresSave: false,

    saveAndCreateButtonEnabled : true,

    afterDuplicate: function () {
        Taco.app.fireEvent('setmessage', "Please enter a product code.", 'info');

    },

    initComponent: function () {
        var me = this;

        this.additionalActions = [{
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
                    itemId: 'live',
                    text: 'View Live',
                    menu: {
                        plain: true,
                        shadow: false,
                        items: []
                    }
                },{
                    itemId: 'preview',
                    text: 'View Staged',
                    menu: {
                        plain: true,
                        shadow: false,
                        items: []
                    }
                },
                
                {
                    xtype: "menuseparator",
                    style: "border:0px;height:1px;background-color:#ccc;margin:6px 0px;"
                }, {
                    text: 'Duplicate',
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'create'
                    },
                    handler: function (item) {
                        var record = me.record,
                            metaData = {
                                id: record.getId()
                            };

                        Taco.app.StateManager.attemptNavigate('products/duplicate/' + record.getId(), metaData);
                    }
                },
                {
                    itemId: 'delete',
                    text: 'Delete',
                    requiredBehaviors: {
                        model: 'Taco.model.Product',
                        behavior: 'destroy'
                    },
                    handler: Ext.bind(me.destroyRecord, me)
                },                
                {
                    itemId: 'changeProductCode',
                    text: 'Change Product Code',
                    handler: Ext.bind(me.changeProductCode, me)
                }
                ],
                listeners: {
                    show: function (menu) {
                        var previewItem = menu.items.get('preview'),
                            liveItems = menu.items.get('live'),
                            changeProductCodeItem = menu.items.get('changeProductCode'),
                            changeProductCodeSeperator = menu.items.get('changeProductCodeSeperator'),
                            previewMenu,
                            liveMenu,
                            previewSites = [],
                            liveSites = [];

                        if (previewItem && previewItem.menu) {
                            previewMenu = previewItem.menu;
                            liveMenu = liveItems.menu;
                            Ext.each(me.record.getProductInCatalogs().data.items,function (pis) {
                                var sites = pis.get('sites');
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
                            });



                            if (!Ext.Array.equals(Ext.Array.pluck(previewSites, 'itemId'), previewMenu.items.keys)) {
                                previewMenu.removeAll();
                                previewMenu.add(previewSites);
                                liveMenu.removeAll();
                                liveMenu.add(liveSites);
                            }

                            // check to see if the product is phantom if so disable the change product code option
                            if (me.record.phantom || !Ext.Array.contains(Taco.user.behaviors, 220)) {
                                changeProductCodeItem.hide();
                            } else {
                                changeProductCodeItem.show();
                            }

                           
                            }
                        },
                        scope: this
                    }
            }
        }];
                
        this.formCfg = Ext.apply(this.formCfg || {}, { options: this.options, isDuplicate:this.isDuplicate });

        
        this.callParent(arguments);
    },

    viewInSite: function (site, env) {
        window.open('/_gosite/' + site.id + '?environment='+ env+'&redir=' + encodeURIComponent('/p/' + this.record.getId()));
    },
    onBeforeRender: function () {
        var me = this;
        
        this.callParent(arguments);

        //if (me.publishButton) {
            // if the form becomes invalid disable the publish button
            me.mon(me.form, 'validityChange', function (view, valid) {
                if (me.publishButton) {
                    me.publishButton.setDisabled(!valid);
                }
                
            }, me);

            // if the form gets modified, enable the publish button, but only if its valid when it becomes dirty;
            me.mon(me.form, 'dirtychange', function () {
                
                me.requiresSave = me.form.isDirty();
                
                if (me.publishButton) {
                    // note: I am not calling this.form.isValid() because that call causes the form error messages to appear;
                    var isValid = !me.form.hasInvalidField() && me.form.isDirty();
                    if (isValid) {
                        me.publishButton.enable();
                    }
                }
            }, me);
        //}
        


    

            this.on({
                render: function() {
                    this.publishButton = this.down('button#publish');
                },
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

        if (ctx.masterCatalog) {
            ctx = ctx.masterCatalog;
        }

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

    destroyRecord: function () {
        var me = this;
    
        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: "Are you sure you want to delete this",
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {

                    me.setLoading(true, me.body)
                    me.record.destroy({
                        success: function (m) {
                            var contextUrl = Taco.app.context.getCurrentContext().urlToken;
                            Taco.core.StateManager.attemptNavigate(contextUrl + '/products');
                        },
                        failure: function (m) {
                            Taco.app.fireEvent('setmessage', text, 'error deleting product');
                        },
                        callback: function () {
                            me.setLoading(true, me.body);
                        }
                    })
                }
            }
        });

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
    },


    changeProductCode: function () {
        var me = this,
            focusEl = me.down("#moreButton");

        var productTypeId = me.record.get('productTypeId'),
            productType = this.productTypeStore.getById(productTypeId);

        Ext.create("Taco.view.product.widget.productCode.Modal", {
            product: me.record,
            productType: productType,            
            listeners: {
                'aftersaveclose': function (win, productCode) {
                    // flag product store to be updated                    
                    var productsStore = Taco.core.data.StoreManager.getOrCreate("Taco.store.ProductGrid");
                    if (productsStore) {
                        productsStore.needsRefresh = true;
                    }
                    // need to update the view since the product codes have changed;                                        
                    var contextUrl = Taco.app.context.getCurrentContext().urlToken;
                    Taco.core.StateManager.attemptNavigate(contextUrl + '/products/edit/' + productCode);
                },
                'aftercancelclose': function () {                    
                    // need to pass focus back to the more menu button
                    focusEl.focus();
                },
                scope:me
    }
        });
    
    },
    doCreate : function (){
        var controller = "products"
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    }
});