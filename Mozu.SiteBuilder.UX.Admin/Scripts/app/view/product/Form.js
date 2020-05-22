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

        this.title = this.record.get('productName');

        this.stores = [this.inSitesStore, this.record.getOptions(), this.record.getVariations(false)];

        this.siteForms = [];

        this.masterCatalog = Taco.app.context.getMasterCatalog();

        this.globalForm = Ext.create('Taco.view.product.GlobalForm', {
            record: this.record,
            productForm: this
        });

        this.buildSiteTabs();

        this.tabItems = this.siteForms.slice(0);

        this.tabItems.unshift(this.globalForm);

        this.items = [
            Ext.create('Ext.panel.Panel', {
                itemId: 'productFormLayout',
                layout: {
                    type: 'card',
                },
                items: this.tabItems
            })
        ];

        this.callParent(arguments);
    },

    //todo fix for omni
    getInitialTab: function (tabItems) {
        var selectedTabIndex = 0,
            initCatalogId = (this.options && this.options.catalogId) ? this.options.catalogId : Taco.app.context.getCatalogId();

        if (initCatalogId && !this.isDuplicate) {
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
            record: productInCatalogInfo,
            catlogId: productInCatalogInfo.get('catalogId'),
            productForm: this,
            product: this.record,
            productInCatalogInfo: productInCatalogInfo,
            tasksKeyPrefix: 'site-' + catalogId,
            tabPickerId: '' + catalogId,
            title: title
        });
    },

    /**
     * Shows the global tab when in multisite mode
     * @private
     */
    goGoMultiSite: function () {
        var me = this;

        this.globalForm.buildForm();
        this.tabPanel.showTabAt(0);

        //this.globalForm.loadForm(undefined, true);
        this.rebuildTabs();

        // START HACK
        this.tabPanel.getLayout().activeItem = null;
        this.globalForm.hidden = true;
        // END HACK

        // this.tabPanel.setActiveItemAt(this.tabPanel.items.length - 1);
        //I am defaulting this to the first tab to get around a werid validation issue
        //Note: this is kinda parta Thoms voodo stuff so yea............................
        this.tabPanel.setActiveItemAt(0);
        this.tabPanel.getActiveItem().nav.show();
    },

    savableStateCheck: function () {
        throw 'deprecated function: savableStateCheck';
    },

    goGoCatalogSwitch: function (isRemovingActiveTab) {
        var isOnlyGlobal = this.inSitesStore.count() === 0;
        if (isOnlyGlobal || isRemovingActiveTab) {
            this.goGoMultiSite();
            return;
        }
        this.goGoMultiSite();
    },

    /**
     * Tamper with the model before it saves to the server.
     */
    beforeSave: function() {
        // when saving a product which is a BundleComponent, we cannot include any extras or the service will shit a brick. bug #27643
        if (this.record.get('productUsage') === 'Component') {
            this.record.set('extras', []);
        }

        var selectedOption = this.record.get('options').find(function(option) {
            return option.isProductImageGroupSelector;
        });

        if (selectedOption) {
            var imageGroups = this.record.get('productImageGroups');

            this.record.set('productImageGroups', imageGroups.filter(function(group) {
                group.productImageGroupTags = group.productImageGroupTags.filter(function(tag) {
                    return tag.fqn === selectedOption.attributeFQN;
                });

                return (
                    group.productImageGroupId === 'default' ||
                    group.productImageGroupTags.length !== 0
                );
            }));
        }
       

        function compare(a, b){
            return a.sequence - b.sequence;
        }
          
          var productImages = this.record.get('productImages')
          productImages.sort(compare);


        this.record.set('productImages', productImages);
        this.record.set('_override', {productImages: productImages}); 

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
        });

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
    getNewCatalog: function (catalogId, suspendSwitch) {
        if (this.inSitesStore.getById(catalogId)) {
            return;
        }

        var siteInfo = Ext.create('Taco.model.ProductInCatalogInfo', {
            catalogId: catalogId,
            productCode:this.record.getId()
        });

        //  Crazy Thom code, to get magical things to happen....but not really
        siteInfo.phantom = true;
        this.inSitesStore.add(siteInfo);
        siteInfo.set('productCode', this.record.getId());
        siteInfo.phantom = true;

        return siteInfo;
    },

    /**
     * Removes the product from a site
     * @param  {String} siteId The ID of the site to remove the product from
     */
    resetCatalogs: function (catalogIds) {
        var inactiveRecords = [];
        var newRecords = [];
        var currentRecordIds = this.inSitesStore.data.items.map(function(rec) { return rec.get('catalogId');});

        var addCatalogs = Ext.Array.difference(catalogIds, currentRecordIds);
        var removeCatalogs = Ext.Array.difference(currentRecordIds, catalogIds);

        this.inSitesStore.each(function(rec) {
            if (removeCatalogs.indexOf(rec.get('catalogId')) !== -1) {
                inactiveRecords.push(rec);
            }
        });

        Ext.Array.each(addCatalogs, function(id) {
            newRecords.push(this.getNewCatalog(id));
        }, this);

        this.inSitesStore.remove(inactiveRecords);

        this.inSitesStore.add(newRecords);

        if (newRecords.length > 0) {
            Ext.Array.each(newRecords, function(page) {
                var siteForm = this.buildSiteForm(page);
                this.down('#productFormLayout').add(siteForm);
                //add new panel to tabitems so it can be managed by catalog assignment bar
                this.tabItems.push(siteForm)
            }, this);
        }
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
                this.getNewCatalog(catalogId, true);
            }, this);

            Ext.each(removeCatalogs, function (catalogId) {
                this.removeCatalog(catalogId, true);
            }, this);

            this.goGoCatalogSwitch();
        }, this);
    }
});
