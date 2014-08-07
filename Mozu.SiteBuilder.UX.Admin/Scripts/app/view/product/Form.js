/**
 * @class Taco.view.product.Form
 * The primary form on the product page that manages single site/multisite switching
 */
Ext.define('Taco.view.product.Form', {
    extend: 'Taco.core.ux.form.Form',
    requires: [
        'Taco.core.ux.tab.Panel',
        'Taco.view.product.GlobalForm',
        'Taco.view.product.SiteForm'
    ],
    alias: ['widget.productform', 'widget.taco-productform' ],
    layout: 'fit',
    createTitle: 'Create New Product',
    requireDirty: false,
    /**
     * @protected
     */
    initComponent: function() {
        var tabItems;

        this.inSitesStore = this.record.productInCatalogsStore();
        
        this.title = this.record.data.productName;
      

        this.stores = [this.inSitesStore, this.record.getOptions(), this.record.getVariations(false)];

        this.siteForms = [];


        this.createSiteInfoCheck();

        this.isSingleSite = this.singleSiteCheck();

        this.masterCatalog = Taco.app.context.getMasterCatalog();

        this.globalForm = Ext.create('Taco.view.product.GlobalForm', {
            record: this.record,
            isSingleSite: this.isSingleSite
        });

        this.buildSiteTabs();

        tabItems = this.siteForms.slice(0);

        tabItems.unshift(this.globalForm);

        this.tabPanel = Ext.create('Taco.core.ux.tab.Panel', {
            navigation: false,
            items: tabItems,
            activeItem: this.getInitialTab(tabItems),
            pickerCfg: {
                data: this.masterCatalog.catalogs
            }
        });

        this.items = [this.tabPanel];

        this.callParent(arguments);

        if(this.isSingleSite) {
            this.goGoSingleSite(true);
        }

        this.tabPanel.on({
            selectionchange: this.onTabSelectionChange,
            scope: this
        });

        this.tabPanel.on({
            tabchange: function (tabPanel, newCard, oldCard, eOpt) {
                if (oldCard.nav) {
                    oldCard.nav.hide();
                }
                if (newCard.nav) {
                    newCard.nav.show();
                }

            },
            scope:this

        });
        

        this.on({
            tabclose: this.onTabClose,
            scope: this
        });
        
    },
    
    //todo fix for omni
    getInitialTab: function (tabItems) {
        var selectedTabIndex = 0,
            initCatalogId = (this.options && this.options.catalogId) ? this.options.catalogId : Taco.app.context.getCatalogId();
            
        if (initCatalogId) {
            Ext.each(tabItems, function(x, index) {
                if (x.catalogId == initCatalogId) {
                    selectedTabIndex = index;
                }
            });
            
           
        }
        return selectedTabIndex;


    },
    


    /**
     * Will remove all the Site tabs (but not global) and rebuild all the forms
     * @private
     */
    rebuildTabs: function () {
        var siteForms = this.tabPanel.items.getRange(1);

        Ext.suspendLayouts();

        Ext.each(siteForms, function (siteForm) {
            this.tabPanel.remove(siteForm);
        }, this);

        this.buildSiteTabs();

        this.tabPanel.add(this.siteForms);
        
        Ext.resumeLayouts();
    },

    /**
     * Builds all the site forms
     * @private
     */
    buildSiteTabs: function () {
        this.siteForms = [];

        this.inSitesStore.data.each(function (info) {
            this.siteForms.push(this.buildSiteForm(info));
        }, this);
    },

    buildSiteForm: function (productInCatalogInfo) {
        var catalogId = productInCatalogInfo.get('catalogId'),
            catalog = this.masterCatalog.findCatalog(catalogId),
            title = catalogId,
            suffix = '';
        if (catalog) {
            title = catalog.name;

            if (catalog.localeCode != this.masterCatalog.localeCode) {
                suffix += catalog.localeCode;
            }
            if (catalog.currencyCode != this.masterCatalog.currencyCode) {
                suffix += ((suffix.length)?' ':'')+ catalog.currencyCode;
            }
            if (suffix) {
                suffix = " ["+suffix+"]";
            }
            title += suffix;
        }

        return Ext.create('Taco.view.product.SiteForm', {
            isSingleSite: this.singleSiteCheck(),
            record: productInCatalogInfo,
            product: this.record,
            productInCatalogInfo: productInCatalogInfo,
            tasksKeyPrefix: 'site-' + catalogId,
            formCfg: {
                isSingleSite: this.isSingleSite
            },
            tabPickerId: '' + catalogId,
            title: title
        });
    },

    /**
     * Hides the global tab when in single site mode
     * @private
     */
    goGoSingleSite: function (leaveTabs) {
        var me = this;
        
        if (!leaveTabs) {
            me.rebuildTabs();
        }

        this.globalForm.isSingleSite = true;
        
        this.globalForm.buildForm();

        if (!me.globalForm.validityOverride) {
            me.globalForm.validityOverride = true;

            me.getForm().hasInvalidField = function () {
                return !!this.getFields().findBy(function(field) {
                    var preventMark = field.preventMark,
                        isValid, globalForm;

                    globalForm = field.findParentBy(function (ct) {
                        return ct.getId() === me.globalForm.getId();
                    });

                    field.preventMark = true;
                    isValid = field.isValid() || (globalForm && ( !globalForm.rendered || globalForm.isHidden()));
                    field.preventMark = preventMark;

                    return !isValid;
                });
            };
        }

        

        me.tabPanel.hideTabAt(0);

        me.tabPanel.setActiveItemAt(1);

        //refresh the visibility of the siteForm
        //me.tabPanel.items.getAt(1).updateSubFormVisibility();


    },

    /**
     * Shows the global tab when in multisite mode
     * @private
     */
    goGoMultiSite: function (leaveTabs) {
        var me = this;
        
        if (!leaveTabs) {
            this.rebuildTabs();
        }
        
        this.globalForm.isSingleSite = false;
        this.globalForm.buildForm();
        //this.globalForm.loadForm(undefined, true);
        this.rebuildTabs();
        this.tabPanel.showTabAt(0);
        
        // START HACK
        this.tabPanel.getLayout().activeItem = null;
        this.globalForm.hidden = true;
        // END HACK
        
        // this.tabPanel.setActiveItemAt(this.tabPanel.items.length - 1);
        //I am defaulting this to the first tab to get around a werid validation issue
        //Note: this is kinda parta Thoms voodo stuff so yea............................
        this.tabPanel.setActiveItemAt(0);
    },
    
    savableStateCheck: function () {
        throw 'deprecated function: savableStateCheck';
    },

    goGoCatalogSwitch: function () {
        var wasSingleSite = this.isSingleSite;

        this.isSingleSite = this.singleSiteCheck();

        //  State unchanged, gfto
        if (wasSingleSite === this.isSingleSite) {
            return;
        }

        
        //  Must rebuild tabs now since stateOrProvince switched
        if (this.isSingleSite) {
            this.goGoSingleSite();
        } else {
            this.goGoMultiSite();
        }
        
        
    },
    
    /**
     * Handles the use case of create in site context mode
     */
    createSiteInfoCheck:function() {
        var ctx;
        if (!this.record.phantom) {
            return;
        }
        ctx = Taco.app.context.getCurrent();
       
        if ( ctx.getCatalogId() != null) {
            this.addCatalog(ctx.getCatalogId());
        }else if (ctx.contextType == 'm' && ctx.catalogs.length == 1) {
            this.addCatalog(ctx.catalogs[0].getCatalogId());
        }
    },

    /**
     * Checks to see if the form is in multisite or singlesite mode
     * @return {Boolean} True if the product is only on one site, false if it's shared
     */
    singleSiteCheck: function () {
        //changing to only run this mode if the user has only one catalogs off of the current master catalog
        return Taco.app.context.getMasterCatalog().catalogs.length < 2;
        //return this.inSitesStore.count() === 1;
    },

    /**
     * Tamper with the model before it saves to the server.
     */
    beforeSave: function () {
        // when saving a product which is a BundleComponent, we cannot include any extras or the service will shit a brick. bug #27643
        if (this.record.get('productUsage') === 'Component') {
            this.record.set('extras', []);
        }

        return this.callParent(arguments);
    },

    /**
     * Adds the sync store task for the ProductsInSiteInfo store (no dependencies)
     * @param {Ext.core.ux.form.Task} tasks The save tasks associated with the form.
     * @return {Ext.core.ux.form.Task} The save tasks associated with the form
     * @protected
     */
    addSaveTasks: function (tasks) {
        var productRecord = this.record,
            variantStore = this.record.getVariations(false),
            variantSaveTask;
            


        this.callParent(arguments);

       
        variantSaveTask = tasks.tasks.findBy(function (innerTask) {
            return innerTask.store == variantStore;
        })
        if (variantSaveTask) {
            tasks.tasks.remove(variantSaveTask);
        }
        tasks.add({
            store: variantStore,
            dependencyFilter: function (innerTask) {
                return innerTask.saveRecord == productRecord;
            }
        });
        

        return tasks;
    },

    /**
     * Adds the product to a site
     * @param {String} siteId The ID of the site that will have the product
     */
    addCatalog: function (catalogId, suspendSwitch) {
        if (this.inSitesStore.getById(catalogId)) {
            return;
        }
        
        

        var siteInfo = Ext.create('Taco.model.ProductInCatalogInfo', {
            catalogId: catalogId,
            productCode:this.record.getId()
        }), siteForm, wasSingleSite;
        
        //  Crazy Thom code, to get magical things to happen....but not really
        siteInfo.phantom = true;
        this.inSitesStore.add(siteInfo);
        siteInfo.set('productCode', this.record.getId());
        siteInfo.phantom = true;
        if (this.rendered) {
            siteForm = this.buildSiteForm(siteInfo);

            this.siteForms.push(siteForm);
            this.tabPanel.add(siteForm);

            if (suspendSwitch) {
                return;
            }
            this.goGoCatalogSwitch();
        }
    },

    /**
     * Removes the product from a site
     * @param  {String} siteId The ID of the site to remove the product from
     */
    removeCatalog: function (catalogId, suspendSwitch) {
        var record = this.inSitesStore.findRecord('catalogId', catalogId),
            wasSingleSite, form;

        if (!record) {
            return;
        }

        Ext.each(this.siteForms, function (f) {
            if (record !== f.productInCatalogInfo) {
                return;
            }
            form = f;
            return false;
        });

        if (!form) {
            return;
        }

        this.tabPanel.remove(form);

        this.inSitesStore.remove(record);
        
        if (suspendSwitch) {
            return;
        }

        this.goGoCatalogSwitch();
    },

    onTabClose: function (tab, catalogId) {
        this.updateForm(function () {
            this.removeCatalog(catalogId);
        }, this);
    },

    onTabSelectionChange: function (tabPanel, values, oldValues) {
        this.updateForm(function () {
            var addCatalogs = Ext.Array.difference(values, oldValues),
                removeCatalogs = Ext.Array.difference(oldValues, values);

            Ext.each(addCatalogs, function (catalogId) {
                this.addCatalog(catalogId, true);
            }, this);

            Ext.each(removeCatalogs, function (catalogId) {
                this.removeCatalog(catalogId, true);
            }, this);

            this.goGoCatalogSwitch();
        }, this);
    }

   
});