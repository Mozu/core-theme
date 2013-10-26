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
    
    layout: 'fit',
    /**
     * @protected
     */
    initComponent: function() {
        var tabItems;

        this.inSitesStore = this.record.productInCatalogsStore();
        
        this.title = this.record.data.productName;
      

        this.stores = [this.inSitesStore, this.record.getOptions(), this.record.getVariations()];

        this.siteForms = [];


        this.createSiteInfoCheck();

        this.isSingleSite = this.singleSiteCheck();

        this.masterCatalog = Taco.app.context.getCurrentMasterCatalog();

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
            catalog = this.masterCatalog.findCatalog(catalogId);

        return Ext.create('Taco.view.product.SiteForm', {
            isSingleSite: this.isSingleSite,
            record: productInCatalogInfo,
            product: this.record,
            productInCatalogInfo: productInCatalogInfo,
            tasksKeyPrefix: 'site-' + catalogId,
            formCfg: {
                isSingleSite: this.isSingleSite
            },
            tabPickerId: '' + catalogId,
            title: catalog ? catalog.name : catalogId
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

             this.globalForm.form.getFields().each(function (field) {
                 var origIsValidate = Object.getPrototypeOf(field).validate,
                     fields = me.form.getFields().filterBy(function (_field) {
                         return _field.name == field.name && _field != field;
                     });
                 field.validate = function () {
                     var ret = origIsValidate.apply(field, arguments);
                     if (!ret) {
                         fields.each(function (_field) {
                             if (_field.validate()) {
                                 ret = true;
                             }

                         });
                     }
                     return ret;
                 };

             });
         }

        me.tabPanel.hideTabAt(0);
        me.tabPanel.setActiveItemAt(1);
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
        this.tabPanel.setActiveItemAt(this.tabPanel.items.length - 1);
       
    },
    
    savableStateCheck: function () {
        var oldState = this.savableState,
            newState = this.isValid() && (!this.isEdit() || this.isDirty());

        if (oldState === newState) {
            return;
        }

        this.savableState = newState;

        this.fireEvent('savablestatechange', this, newState);
    },

    goGoCatalogSwitch: function () {
        var wasSingleSite = this.isSingleSite;

        this.isSingleSite = this.singleSiteCheck();

        //  State unchanged, gfto
        if (wasSingleSite === this.isSingleSite) {
            return;
        }

        //  Must rebuild tabs now since state switched
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
        if (!this.record.phantom) {
            return;
        }
        var catalogId  = Taco.app.context.getCurrent().getCatalogId();
        if (catalogId != null) {
            this.addCatalog(catalogId);
        }
    },

    /**
     * Checks to see if the form is in multisite or singlesite mode
     * @return {Boolean} True if the product is only on one site, false if it's shared
     */
    singleSiteCheck: function () {
        return this.inSitesStore.count() === 1;
    },

    /**
     * Adds the sync store task for the ProductsInSiteInfo store (no dependencies)
     * @param {Ext.core.ux.form.Task} tasks The save tasks associated with the form.
     * @return {Ext.core.ux.form.Task} The save tasks associated with the form
     * @protected
     */
    addSaveTasks: function (tasks) {
        var recordSaveDep = 'save-product-record',
            variantStoreTask={
                store: this.record.getVariations()
            };
        
       
        this.addChildSaveTasks(tasks);

        
        if (tasks.tasks.getByKey(recordSaveDep)) {
            variantStoreTask.dependencies = recordSaveDep;
        }
        
        tasks.add(variantStoreTask);    

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
        this.removeCatalog(catalogId);
    },

    onTabSelectionChange: function (tabPanel, values, oldValues) {
        //console.log('tab selection changed')
        var addCatalogs= Ext.Array.difference(values, oldValues),
            removeCatalogs = Ext.Array.difference(oldValues, values);

        Ext.each(addCatalogs, function (catalogId) {
            this.addCatalog(catalogId, true);
        }, this);

        Ext.each(removeCatalogs, function (catalogId) {
            this.removeCatalog(catalogId, true);
        }, this);

        this.goGoCatalogSwitch();
    },

    /**
     * @private
     * @param {Object} sites A list of all sites that are associated with this product. 
     *                       Property names are siteIds, values are the siteNames.
     */
    handleSelectionChange: function (sites) {
        //console.log( 'handleSelectionChange', sites );
        Ext.Object.each(sites, function (siteId, siteName) {
            // TODO

        });
    }
});