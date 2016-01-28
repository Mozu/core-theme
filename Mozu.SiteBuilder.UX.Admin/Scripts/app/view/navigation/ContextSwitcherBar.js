/**
 * @class Taco.view.navigation.ContextSwitcherBar
 * @author Taco
 *
 */

 Ext.define('Taco.view.navigation.ContextSwitcherBar', {
    extend: 'Ext.container.Container',
    alias: 'taco.contextswitcherbar',
    cls: 'taco-context-switcher-bar',

    requires: [
        'Taco.core.ux.picker.InlineSelector',
        'Taco.core.ux.picker.Selector'
    ],

    layout: {
        type: 'hbox',
        align: 'stretch'
    },

    statics: {
        contextLevels: ['t', 'm', 'c', 's']
    },

    initComponent: function () {

        this.callParent(arguments);


        this.currentContext = Taco.app.context.getCurrent();

        this.currentTentant = Taco.app.context.getContextAtLevel('t');
        this.currentMasterCatalog = Taco.app.context.getContextAtLevel('m');
        this.currentCatalog = Taco.app.context.getContextAtLevel('c');
        this.currentSite = Taco.app.context.getContextAtLevel('s');

        this.visibleLevels = this.determineVisibleContexts();

        this.rebuildContexts();
    },

    rebuildContexts: function () {
        this.selectors = [];

        this.buildTenantContext();
        this.buildMasterCatalogContext();
        this.buildCatalogContext();
        this.buildSiteContext();

        Ext.suspendLayouts();
        this.removeAll();

        this.add(this.selectors);

        Ext.resumeLayouts(true);
    },

    buildTenantContext: function () {
        var tenant;

        if (!this.isVisible('t')) {
            return;
        }

        tenant = this.currentTentant;

        this.selectors.push(Ext.widget({
            defaultText: tenant.name,
            disableSelection: !this.isSupported('t'),
            disableTrigger: true,
            highlighted: tenant === this.currentContext,
            listeners: {
                select: function (view, record) {
                    Taco.app.context.setCurrentTenant();
                    view.highlight();
                }
            },
            tagText: 'tenant',
            xtype: 'taco.pickerselector',
        }));
    },

    buildMasterCatalogContext: function () {
        var highlighted,
            masterCatalog,
            data;

        if (!this.isVisible('m')) {
            return;
        }

        masterCatalog = this.currentMasterCatalog;

        data = this.generateStoreData(Taco.app.context.masterCatalogs);

        highlighted = masterCatalog === this.currentContext;

        if (this.visibleLevels.indexOf('m') === this.visibleLevels.length - 1 && this.isSupported('m')) {

            highlighted = highlighted ||
                (this.currentContext.masterCatalog
                    && this.currentContext.masterCatalog.id === masterCatalog.id);

            this.selectors.push(Ext.widget({
                callToActionText: 'Switch Master Catalog:',
                highlighted: highlighted,
                labelText: 'Masters',
                listeners: {
                    select: function (view, record) {
                        Taco.app.context.setCurrentMasterCatalog(record.get('value'));
                        view.highlight();
                    }
                },
                store: data,
                tagText: 'master',
                value: masterCatalog.id,
                xtype: 'taco.inlineselector'
            }));
        } else {

            this.selectors.push(Ext.widget({
                callToActionText: 'Switch Master Catalog:',
                disableSelection: !this.isSupported('m'),
                highlighted: highlighted,
                listeners: {
                    select: function (view, record) {
                        Taco.app.context.setCurrentMasterCatalog(record.get('value'));
                        view.highlight();
                    },
                    change: function (view, record) {
                        this.setMasterCatalogLocalContext(record);
                        this.rebuildContexts();
                    },
                    scope: this
                },
                store: data,
                tagText: 'master',
                value: masterCatalog.id,
                xtype: 'taco.pickerselector'
            }));
        }


    },

    setMasterCatalogLocalContext: function (record) {
        var mc = Ext.Array.findBy(this.currentTentant.masterCatalogs, function (mc) {
            return mc.id === record.get('value');
        });

        if (mc) {
            this.currentMasterCatalog = mc;
        }
    },

    buildCatalogContext: function () {
        var highlighted,
            masterCatalog,
            catalog,
            data;

        if (!this.isVisible('c')) {
            return;
        }

        masterCatalog = this.currentMasterCatalog;
        catalog = this.currentCatalog;
        highlighted = catalog === this.currentContext;

        if (!catalog) {
            return;
        }

        data = this.generateStoreData(masterCatalog.catalogs);

        if (this.visibleLevels.indexOf('c') === this.visibleLevels.length - 1 && this.isSupported('c')) {

            highlighted = highlighted ||
                (this.currentContext.catalog
                    && this.currentContext.catalog.id === catalog.id);

            this.selectors.push(Ext.widget({
                callToActionText: 'Switch Catalog:',
                highlighted: highlighted,
                labelText: 'Catalogs',
                listeners: {
                    select: function (view, record) {
                        Taco.app.context.setCurrentCatalog(record.get('value'));
                        view.highlight();
                    }
                },
                store: data,
                tagText: 'catalog',
                value: catalog.id,
                xtype: 'taco.inlineselector'
            }));
        } else {
            this.selectors.push(Ext.widget({
                callToActionText: 'Switch Catalog:',
                disableSelection: !this.isSupported('c'),
                highlighted: highlighted,
                listeners: {
                    select: function (view, record) {
                        Taco.app.context.setCurrentCatalog(record.get('value'));
                        view.highlight();
                    }
                },
                store: data,
                tagText: 'catalog',
                value: catalog.id,
                xtype: 'taco.pickerselector'
            }));
        }
    },

    buildSiteContext: function () {
        var masterCatalog,
            site,
            data;

        if (!this.isVisible('s')) {
            return;
        }

        masterCatalog = this.currentMasterCatalog;
        site = this.currentSite;

        data = this.generateStoreData(masterCatalog.sites);

        if (!site) {
            return;
        }

        this.selectors.push(Ext.widget({
            callToActionText: 'Switch Site:',
            highlighted: site === this.currentContext,
            labelText: 'Sites',
                listeners: {
                    select: function (view, record) {
                        Taco.app.context.setCurrentSite(record.get('value'));
                        view.highlight();
                    }
                },
            store: data,
            value: site.id,
            xtype: 'taco.inlineselector'
        }));
    },

    generateStoreData: function (array) {
        return Ext.Array.map(array, function (val) {
            return [val.id, val.name];
        });
    },

    determineVisibleContexts: function() {
        var visibleLevels = [];

        if (this.isSupported('t')) {
            visibleLevels.push('t')
        }

        if (this.isSupported('m')) {
            visibleLevels.push('m')
        }

        if (this.isSupported('c')) {
            visibleLevels.push('m');
            visibleLevels.push('c');
        }

        if (this.isSupported('s')) {
            visibleLevels.push('m');
            visibleLevels.push('s');
        }

        return Ext.Array.filter(visibleLevels, function (val, index, self) {
            return self.indexOf(val) === index;
        });
    },

    isSupported: function (type) {
        return this.supportedLevels ? this.supportedLevels.indexOf(type) > -1 : false;
    },

    isVisible: function(type) {
        return this.visibleLevels.indexOf(type) > -1;
    }
 });