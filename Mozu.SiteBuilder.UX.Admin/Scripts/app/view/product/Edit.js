Ext.define('Taco.view.product.Edit', {
    extend: 'Taco.core.ux.form.FullEditor',
    requires: [
        'Taco.view.product.Form',
        'Taco.view.product.widget.productCode.Modal',
        'Taco.view.publishing.modal.PublishSetPicker',
        'Ext.button.Button',
        'Ext.menu.Item',
        'Ext.form.Label',
        'Taco.store.PublishSets',
        'Taco.core.ux.content.IndicatorContainer'
    ],

    statics: {
        sizes: {},
        factory: function(cfg, callback, scope) {
            var tasks = [];

            cfg = Ext.apply(cfg, {

            });

            // need to preload the productType Record so that the views can layout correctly
            var productTypeId = cfg.record.get("productTypeId");

            if (productTypeId) {
                cfg = Ext.apply(cfg, {
                    productTypeRecord: {
                        type: 'Taco.model.ProductType',
                        id:productTypeId
                    }
                });

                tasks.push({
                    modelToLoad: cfg.productTypeRecord
                });
            }

            Ext.create('Taco.core.ux.form.Tasks', {
                finalCallback: function () {
                    // cached the productTypeRecord for use when laying out the views;
                    cfg.record.productTypeRecord = (cfg.productTypeRecord && cfg.productTypeRecord.record) ? cfg.productTypeRecord.record : null;
                    callback.call(scope || this, Ext.create('Taco.view.product.Edit', cfg));
                },
                tasks: tasks,
                autoExecute: true
            });
        }
    },

    alias: "widget.taco-product-editor",

    formCls: 'Taco.view.product.Form',

    enableNextPrevious: true,

    nextPreviousCfg: {
        store: "Taco.store.ProductGrid",
        stateId: "statefulProductGrid",
        nextButtonTipTpl: "Next Product <div style='padding-top:10px;'>{productName}</div><div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:center;color:#ccc;font-size:11px;'>{shortCutTip}</div>",
        previousButtonTipTpl: "Previous Product <div style='padding-top:10px;'>{productName}</div><div style='margin-top:5px;border-top:1px solid #ccc;padding-top:10px;text-align:center;color:#ccc;font-size:11px;'>{shortCutTip}</div>",
        url: "/products/edit/"
    },


    // state property of the form that gets set to true whtn the form and its child panels get dirtied. 
    // note that isDirty seems to always return true. Which necessitated this work around;  The manageInventory button in the inventory subform checks this value before navigating to the inventory view.
    // Todo: figure out why the isDirty is always true and generalize the isDirty Prompt for reuse rathaer than part of the inventory subform.
    requiresSave: false,

    saveAndCreateButtonEnabled : true,

    afterDuplicate: function () {
        Taco.app.fireEvent('setmessage', "Please enter a product code.", 'info');
        Taco.app.fireEvent('productduplicated', true);
    },

    initComponent: function () {
        var me = this;

        this.publishNowMenuItem = Ext.widget('menuitem', {
            text: 'Publish Now',
            disabled: this.record.get('publishedState') === 'Live',
            //requiredBehaviors: {
            //    model: 'Taco.model.Product',
            //    behavior: 'create'
            //},
            listeners: {
                click: {
                    fn: me.onClickPublish,
                    scope: me
                }
            }
        });

        this.discardDraftMenuItem = Ext.widget('menuitem', {
            text: 'Discard Draft',
            disabled: this.record.get('publishedState') === 'Live',
            //requiredBehaviors: {
            //    model: 'Taco.model.Product',
            //    behavior: 'publish'
            //},
            listeners: {
                click: {
                    scope: me,
                    fn: me.discardProductDraft
                }
            }
        });

        this.removePublishSetMenuItem = Ext.widget('menuitem', {
            text: 'Remove from Publish Set',
            disabled: !this.record.get('publishSetCode'),
            //requiredBehaviors: {
            //    model: 'Taco.model.Product',
            //    behavior: 'create'
            //},
            listeners: {
                click: {
                    scope: me,
                    fn: me.removePublishSet
                }
            }
        });

        if (this.checkProductPublishing()) {
            this.titlePanel = Ext.widget('taco-indicator', {
                afterrender: function(toolTip) {
                    var pubInfo = me.record.getPublishingInfo();
                    
                    if (pubInfo.publishSetInfo) {
                        Ext.create('Taco.core.ux.action.Action', {
                            text: pubInfo.publishSetInfo.name,
                            renderTo: 'publishSetName',
                            listeners: {
                                click: {
                                    fn: function(cmp) {
                                        toolTip.tipContent.hide();
                                        Taco.app.StateManager.attemptNavigate('/publishing/publishsets/' + pubInfo.publishSetInfo.code);
                                    }
                                }
                            }
                        });
                    }
                   
                }
            });
        }

        this.publishingButton = Ext.widget('button', {
            ui: 'action-primary',
            scale:"medium",
            itemId: 'publish',
            text: 'Publishing',
            beforeItemId: 'cancelActionButton',
            margin: '0 0 0 10',
            hidden: !this.checkProductPublishing(),
            disabled: this.record.phantom,
            scope: me,
            menuAlign: 'tr-br?',
            menu: {
                plain: true,
                shadow: false,
                items: [
                    this.publishNowMenuItem,
                    {
                        text: 'Move to Publish Set',
                        //requiredBehaviors: {
                        //    model: 'Taco.model.Product',
                        //    behavior: 'create'
                        //},
                        listeners: {
                            click: {
                                scope: me,
                                fn: me.movePublishSet
                            }
                        }
                    },
                    this.removePublishSetMenuItem,
                    this.discardDraftMenuItem
                ]
            }
        });

        this.additionalActions = [
            this.publishingButton,
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
                    disabled: me.record.phantom,
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
                            deleteButtonItem = menu.items.get('delete'),
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

        if (this.checkProductPublishing()) {
            this.setPublishStatus();
        }

        this.formCfg = Ext.apply(this.formCfg || {}, { options: this.options, isDuplicate:this.isDuplicate });
        this.callParent(arguments);
    },

    setPublishStatus: function() {
        var pubInfo = this.record.getPublishingInfo(),
            tooltipContent = '',
            extraStyle = '',
            generateTooltipKey = function (content) {
                return "<span style='width:90px;font-weight: bold;float:left;'>" + content + "</span>";
            },
            generateTooltipValue = function (content, additionalStyle, id) {
                return "<span id='" + id + "' style='padding-left: 5px;float:left;" + additionalStyle + "'>" + content + "</span>";
            };

        if (!this.checkProductPublishing()) {
            return;
        }

        if (pubInfo.statusText) {
            extraStyle = (!pubInfo.publishSetInfo) ? 'font-style:italic;' : '';
            tooltipContent = generateTooltipKey('Publish Set:');
            if (pubInfo.publishSetInfo) {
                tooltipContent += generateTooltipValue('', '', 'publishSetName');
            } else {
                tooltipContent += generateTooltipValue('None', extraStyle);
            }
            tooltipContent += "<br/>";
            tooltipContent += generateTooltipKey('Publish Date:');
            tooltipContent += generateTooltipValue((pubInfo.publishSetInfo && pubInfo.publishSetInfo.scheduledDate
                    ? Ext.Date.format(pubInfo.publishSetInfo.scheduledDate, 'F j, Y, g:i a T')
                    : 'Unscheduled'), extraStyle);

            this.titlePanel.setTooltipContent(tooltipContent);
            this.titlePanel.setText(pubInfo.statusText, false);
            this.titlePanel.show();
        } else {
            this.titlePanel.hide();
        }
        this.publishingButton.setDisabled(!pubInfo.enabled.publish);
        this.removePublishSetMenuItem.setDisabled(!pubInfo.enabled.remove);
        this.publishNowMenuItem.setDisabled(!pubInfo.enabled.now);
        this.discardDraftMenuItem.setDisabled(!pubInfo.enabled.discard);
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
                    me.publishNowMenuItem.setDisabled(!valid);
                }
                
            }, me);

            // if the form gets modified, enable the publish button, but only if its valid when it becomes dirty;
            me.mon(me.form, 'dirtychange', function () {
                
                me.requiresSave = me.form.isDirty();
                
                if (me.publishButton) {
                    // note: I am not calling this.form.isValid() because that call causes the form error messages to appear;
                    var isValid = !me.form.hasInvalidField() && me.form.isDirty();
                    if (isValid) {
                        if (me.record.get('publishedState') === 'Live') {
                            this.record.set('publishedState', 'Draft');
                        }
                        me.setPublishStatus();
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
            //todo: message invalid.
            return;
        }

        
        this.publishButton.addCls('taco-button-processing');
        this.publishButton.setText('Processing...');

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

    movePublishSet: function () {
        var me = this,
            modal = Ext.create('Taco.view.publishing.modal.PublishSetPicker', {
                record: me.record,
                callback: function (publishSetCode) {
                    me.record.set('publishSetCode', publishSetCode);
                    if (publishSetCode) {
                        var store = Ext.create('Taco.store.PublishSets', {includeCounts: false});
                        store.load(function(records, operation, success) {
                            var model = Ext.Array.findBy(records, function(item) {
                                return item.get('code') === publishSetCode;
                            });
                            if (model) {
                                me.record.set('publishSetName', model.get('name'));
                                me.record.set('publishSetDate', model.get('publishDate'));
                            }
                            me.setPublishStatus();
                        });

                        //todo: handle model not found greg_murray on 7/24/2015
                    }
                }
            });

        modal.show();
    },

    setProductRecordPublishSetToNull: function() {
        this.record.set('publishSetCode', null);
        // this.record.set('publishSetName', null);
        // this.record.set('publishSetDate', null);
    },

    removePublishSet: function() {
        this.setProductRecordPublishSetToNull();
        this.setPublishStatus();
    },

    discardProductDraft: function () {
        var me = this;
        this.publishButton.addCls('taco-button-processing');
        this.publishButton.setText('Processing...');
        this.record.discardDraft({
            success: function (scope, items) {
                Taco.core.StateManager.attemptNavigate(me.getEditRoute() + '/' + me.record.getId(), { record: me.record });
            },
            failure: function (response) {
                var json = Ext.decode(response.responseText, true),
                    msg = (json && json.message) ? json.message : '';
                me.resetPublishButton();
                Taco.app.fireEvent('setmessage', 'Error discarding draft.' + msg, 'error');
            }
        });
    },

    destroyRecord: function () {
        var me = this;
    
        Ext.MessageBox.show({
            title: 'Delete',
            // pushes the buttons to the right to be consistant with our dialog ux.
            rightJustifyButtons: true,
            // reverses the order of the buttons
            reverseOrder: true,
            msg: "Are you sure you want to delete this?",
            closable: false,
            buttons: Ext.Msg.YESNO,
            fn: function (val) {
                if (val === 'yes') {                    
                    me.setLoading(true, me.body)
                    me.record.destroy({
                        success: function (m) {
                            var productsStore = Taco.core.data.StoreManager.getOrCreate("Taco.store.ProductGrid");
                            if (productsStore) {
                                productsStore.needsRefresh = true;
                            }

                            var contextUrl = Taco.app.context.getCurrentContext().urlToken;                            
                            // need to invalidate the grid store so that the record is removed;
                            Taco.core.StateManager.attemptNavigate(contextUrl + '/products');
                        },
                        failure: function (m) {
                            Taco.app.fireEvent('setmessage', 'error deleting product', 'error');
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
                this.resetPublishButton();
                this.setProductRecordPublishSetToNull();
                this.record.set('publishedState', 'Live');
                this.setPublishStatus();
                if (this.fireIdChangeAfterPublish) {
                    this.resumeEvent('idchange');
                    this.fireEvent('idchange', this, this.record);
                }
            },
            failure: function (err) {
                var errMsg = (err && err.responseText) ? JSON.parse(err.responseText).message : '';
                Taco.app.fireEvent('setmessage', 'Product change was unable to be published.  ' + errMsg, 'error');
                this.resetPublishButton();
            },
            callback: function () {
                this.doPublishAfterSave = false;
            },
            scope: this
        });
    },

    resetPublishButton : function() {
        this.publishButton.removeCls('taco-button-processing');
        this.publishButton.setText('Publishing');
        this.publishNowMenuItem.disable(true);
    },

    changeProductCode: function () {
        var me = this,
            focusEl = me.down("#moreButton");

        var productTypeId = me.record.get('productTypeId'),
            productType = this.record.productTypeRecord;

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
        var controller = "products";
        Taco.app.StateManager.attemptNavigate(controller + '/create');
    }
});