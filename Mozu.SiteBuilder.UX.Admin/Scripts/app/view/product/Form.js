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

        this.inSitesStore = this.record.productInSitesStore();
        




        this.stores = [this.inSitesStore];

        this.siteForms = [];


        this.createSiteInfoCheck();

        this.isSingleSite = this.singleSiteCheck();

        this.siteCollection = Taco.app.context.getCurrentSiteCollection();

        this.globalForm = Ext.create('Taco.view.product.GlobalForm', {
            record: this.record
        });

        this.buildSiteTabs();

        tabItems = this.siteForms.slice(0);

        tabItems.unshift(this.globalForm);

        this.tabPanel = Ext.create('Taco.core.ux.tab.Panel', {
            navigation: true,
            items: tabItems,
            activeItem: this.getInitialTab(tabItems),
            pickerCfg: {
                data: this.siteCollection.sites
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

        this.on({
            tabclose: this.onTabClose,
            scope: this
        });
        
    },
    
    getInitialTab: function (tabItems) {
        var selectedTabIndex = 0, initSiteId = (this.options && this.options.siteId) ? this.options.siteId : Taco.app.context.getSiteId();
        if (initSiteId) {
            Ext.each(tabItems, function(x, index) {
                if (x.siteId == initSiteId) {
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

    buildSiteForm: function (productInSiteInfo) {
        var siteId = productInSiteInfo.get('siteId'),
            site = this.siteCollection.findSite(siteId);

        return Ext.create('Taco.view.product.SiteForm', {
            isSingleSite: this.isSingleSite,
            record: productInSiteInfo,
            product: this.record,
            productInSiteInfo: productInSiteInfo,
            tasksKeyPrefix: 'site-' + siteId,
            formCfg: {
                isSingleSite: this.isSingleSite
            },
            tabPickerId: '' + siteId,
            title: site ? site.name : siteId
        });
    },

    /**
     * Hides the global tab when in single site mode
     * @private
     */
    goGoSingleSite: function (leaveTabs) {
        if (!leaveTabs) {
            this.rebuildTabs();
        }
        this.globalForm.isSingleSite = true;
        this.tabPanel.hideTabAt(0);
        this.tabPanel.setActiveItemAt(1);
    },

    /**
     * Shows the global tab when in multisite mode
     * @private
     */
    goGoMultiSite: function (leaveTabs) {
        if (!leaveTabs) {
            this.rebuildTabs();
        }
        
        this.globalForm.isSingleSite = false;
        this.globalForm.loadForm(undefined, true);
        this.rebuildTabs();
        this.tabPanel.showTabAt(0);
        this.tabPanel.setActiveItemAt(this.tabPanel.items.length - 1);
    },

    goGoSiteSwitch: function () {
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
        var site = Taco.app.context.getCurrentSite();
        if (site != null) {
            this.addSite(site.id);
        }
    },

    /**
     * Checks to see if the form is in multisite or singlesite mode
     * @return {Boolean} True if the product is only on one site, false if it's shared
     */
    singleSiteCheck: function () {
        return this.inSitesStore.data.length === 1;
    },

    /**
     * Adds the sync store task for the ProductsInSiteInfo store (no dependencies)
     * @param {Ext.core.ux.form.Task} tasks The save tasks associated with the form.
     * @return {Ext.core.ux.form.Task} The save tasks associated with the form
     * @protected
     */
    addSaveTasks: function (tasks) {

        //tasks.add({
        //    key: 'sync-productInSiteInfo-store',
        //    store: this.inSitesStore
        //});

        this.addChildSaveTasks(tasks);

        return tasks;
    },

    /**
     * Adds the product to a site
     * @param {String} siteId The ID of the site that will have the product
     */
    addSite: function (siteId, suspendSwitch) {
        if (this.inSitesStore.getById(siteId)) {
            return;
        }
        var siteInfo = Ext.create('Taco.model.ProductInSiteInfo', {
            siteId: siteId,
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
            this.goGoSiteSwitch();
        }
    },

    /**
     * Removes the product from a site
     * @param  {String} siteId The ID of the site to remove the product from
     */
    removeSite: function (siteId, suspendSwitch) {
        var record = this.inSitesStore.findRecord('siteId', siteId),
            wasSingleSite, form;

        if (!record) {
            return;
        }

        Ext.each(this.siteForms, function (f) {
            if (record !== f.productInSiteInfo) {
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

        this.goGoSiteSwitch();
    },

    onTabClose: function (tab, siteId) {
        this.removeSite(siteId);
    },

    onTabSelectionChange: function (tabPanel, values, oldValues) {
        //console.log('tab selection changed')
        var addSites = Ext.Array.difference(values, oldValues),
            removeSites = Ext.Array.difference(oldValues, values);

        Ext.each(addSites, function (siteId) {
            this.addSite(siteId, true);
        }, this);

        Ext.each(removeSites, function (siteId) {
            this.removeSite(siteId, true);
        }, this);

        this.goGoSiteSwitch();
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