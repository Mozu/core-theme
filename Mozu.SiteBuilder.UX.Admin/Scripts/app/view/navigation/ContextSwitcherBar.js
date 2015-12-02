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

        this.visibleLevels = this.determineVisibleContexts();

        this.rebuildContexts();
    },

    rebuildContexts: function () {
        this.selectors = [];

        this.buildTenantContext();
        this.buildMasterCatalogContext();
        this.buildCatalogContext();
        this.buildSiteContext();

        this.add(this.selectors);
    },

    buildTenantContext: function () {
        var tenant;

        if (!this.isVisible('t')) {
            return;
        }

        tenant = Taco.app.context.getContextAtLevel('t');

        this.selectors.push(Ext.widget({
            defaultText: tenant.name,
            disableSelection: this.isSupported('t'),
            disableTrigger: true,
            highlighted: tenant === this.currentContext,
            tagText: 'tenant',
            value: tenant.id,
            xtype: 'taco.pickerselector',
        }));
    },

    buildMasterCatalogContext: function () {
        var masterCatalog,
            data;

        if (!this.isVisible('m')) {
            return;
        }

        masterCatalog = Taco.app.context.getContextAtLevel('m');

        data = this.generateStoreData(Taco.app.context.masterCatalogs);

        if (this.visibleLevels.indexOf('m') === this.visibleLevels.length - 1 && this.isSupported('m')) {
            this.selectors.push(Ext.widget({
                highlighted: masterCatalog === this.currentContext,
                labelText: 'Masters',
                store: data,
                value: masterCatalog.id,
                xtype: 'taco.inlineselector'
            }));
        } else {
            this.selectors.push(Ext.widget({
                disableSelection: this.isSupported('m'),
                highlighted: masterCatalog === this.currentContext,
                listeners: {
                    select: function (view, record) {
                        Taco.app.context.setCurrentMasterCatalog(record.get('value'));
                        view.highlight();
                    }
                },
                store: data,
                tagText: 'master',
                value: masterCatalog.id,
                xtype: 'taco.pickerselector'
            }));
        }


    },

    buildCatalogContext: function () {
        var masterCatalog,
            catalog,
            data;

        if (!this.isVisible('c')) {
            return;
        }

        masterCatalog = Taco.app.context.getContextAtLevel('m');
        catalog = Taco.app.context.getContextAtLevel('c');

        if (!catalog) {
            return;
        }

        data = this.generateStoreData(masterCatalog.catalogs);

        if (this.visibleLevels.indexOf('c') === this.visibleLevels.length - 1 && this.isSupported('c')) {
            this.selectors.push(Ext.widget({
                highlighted: catalog === this.currentContext,
                labelText: 'Catalogs',
                listeners: {
                    select: function (view, record) {
                        Taco.app.context.setCurrentCatalog(record.get('value'));
                        view.highlight();
                    }
                },
                store: data,
                value: catalog.id,
                xtype: 'taco.inlineselector'
            }));
        } else {
            this.selectors.push(Ext.widget({
                disableSelection: this.isSupported('c'),
                highlighted: catalog === this.currentContext,
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

        masterCatalog = Taco.app.context.getContextAtLevel('m');
        site = Taco.app.context.getContextAtLevel('s');

        data = this.generateStoreData(masterCatalog.sites);

        if (!site) {
            return;
        }

        this.selectors.push(Ext.widget({
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
        return this.supportedLevels.indexOf(type) > -1;
    },

    isVisible: function(type) {
        return this.visibleLevels.indexOf(type) > -1;
    },

    changeContext: function (field, newValue, oldValue) {

    },

    onGlobalContextChange: function (context) {

    },

    onGlobalStateChange: function (state) {

    }
 });