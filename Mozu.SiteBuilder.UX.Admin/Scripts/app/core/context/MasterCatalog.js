Ext.define('Taco.core.context.MasterCatalog', {
    //extend: 'Ext.util.Observable',
    requires: [
        'Taco.core.util.ExceptionWhiner'
    ],

    urlToken: null,
    contextType: 'm',
    name: '',
    id: -1,
    sites: null,

    // config: {
    //     productPublishingMode: 'Live'
    // },

    constructor: function (config) {
        var me = this;
        var sites = [],
            catalogs = [];

        if (me.sites) {
            sites = Ext.Array.clone(me.sites);
        }

        if (me.catalogs) {
            catalogs = Ext.Array.clone(me.catalogs);
        }

        me.sites = sites;
        me.catalogs = catalogs;

        config = Ext.apply({}, config);
        Ext.apply(me, config);


        me.callParent([config]);


        me.urlToken = me.contextType + '-' + me.id;

        Ext.each(me.catalogs, function (catalog, idx) {
            catalog.masterCatalog = me;
            me.catalogs[idx] = Ext.create('Taco.core.context.Catalog', catalog);
        });

        Ext.each(me.sites, function (site, idx) {
            site.masterCatalog = me;
            me.sites[idx] = Ext.create('Taco.core.context.Site', site);
            me.sites[idx].catalog = Ext.Array.findBy(me.catalogs, function (cat) {
                return site.catalogId == cat.id;
            });
            if (me.sites[idx].catalog) {
                me.sites[idx].catalog.sites.push(me.sites[idx]);
            }

        });


    },
    formatCurrency: function (value) {
        return Taco.app.context.formatCurrencyFromCode(this.currencyCode, value);
    },


    getMasterCatalog: function () {
        return this;
    },

    getSite: function () {
        return null;
    },

    isContentPublishingEnabled: function () {
        return this.contentPublishingEnabled;
    },
    updateContentPublishingMode: function (value) {
        this.publishingEnabled = value == 'Pending';

        Ext.Ajax.request({
            url: '/admin/app/cmspublishing/enablePublishing',
            method: 'POST',
            jsonData: {
                context: {
                    masterCatalogId: this.id
                },
                publishingEnabled: this.publishingEnabled
            }
        });
        console.log('updateContentPublishingMode for Site ID', this.id, ' -> ', value);
    },
    getSiteId: function () {
        //if (this.sites.length == 1) {
        //    return this.sites[0].getSiteId();
        //}
        return null;

    },

    findSite: function (id) {
        var site;

        Ext.each(this.sites, function (s) {
            if (s.id === id) {
                site = s;
                return false;
            }
        });

        return site;
    },

    findCatalog: function (id) {
        var catalog;

        Ext.each(this.catalogs, function (s) {
            if (s.id === id) {
                catalog = s;
                return false;
            }
        });

        return catalog;
    },

    getMasterCatalogId: function () {

        return this.id;
    },
    getCatalogId: function () {

        return null;
    },
    getCatalog: function () {
        return null;
    },

    getSupportedLocales: function (excludeDefaultLocale) {
        var distinctLocales = [],
            defaultLocale = this.localeCode;

        if (!this.catalogs) return distinctLocales;

        Ext.each(this.catalogs, function (cat) {
            if ( Ext.Array.indexOf(distinctLocales , cat.localeCode) == -1 && (!excludeDefaultLocale || defaultLocale !== cat.localeCode)) {
                distinctLocales.push(cat.localeCode);
            }
        });
        return distinctLocales;
    },

    getSupportedCurrencies: function (excludeDefaultCurrency) {
        var distinctCurrencies = [],
            defaultCurrencyCode = this.currencyCode;
        if (!this.catalogs) return distinctCurrencies;

        Ext.each(this.catalogs, function (cat) {
            if ( Ext.Array.indexOf( distinctCurrencies,cat.currencyCode) == -1 && (!excludeDefaultCurrency || defaultCurrencyCode !== cat.currencyCode)) {
                distinctCurrencies.push(cat.currencyCode);
            }
        });
        return distinctCurrencies;
    },

    isSiteSameCountryAsMasterCatalog: function (site) {
        return (site.currencyCode === this.currencyCode && site.localeCode === this.localeCode);
    },

    updateProductPublishingMode: function (mode, isLiveEdit) {
        Ext.Ajax.request({
            url: '/admin/app/settings/publishing/product',
            method: 'POST',
            jsonData: {
                masterCatalogId: this.id,
                productPublishingMode: mode,
                isLiveEditEnabled: isLiveEdit
            },
            success: function () {
                this.productPublishingMode = mode;
                this.isLiveEditEnabled = isLiveEdit;
            },
            failure: Taco.core.util.ExceptionWhiner.handleRemoteFailure,
            scope: this
        });
    }
});