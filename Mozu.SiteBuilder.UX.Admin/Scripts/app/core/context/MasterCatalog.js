Ext.define('Taco.core.context.MasterCatalog', {
    //extend: 'Ext.util.Observable',
    urlToken: null,
    contextType: 'c',
    name: '',
    id: -1,
    sites: null,

    // config: {
    //     productPublishingMode: 'Live'
    // },
    
    constructor: function (config) {
        var me = this;
        var sites = [];
       
        if (me.sites) {
            sites = Ext.Array.clone(me.sites);
        }

        me.sites = sites;
        config = Ext.apply({}, config);
        Ext.apply(me, config);
        
        me.callParent([config]);

        me.urlToken = me.contextType +'-'+ me.id;
        
        Ext.each(me.sites, function (site, idx) {
            site.masterCatalog = me;
            me.sites[idx]= Ext.create('Taco.core.context.Site', site);
        });
        

        var catalogs = [];

        if (me.catalogs) {
            catalogs = Ext.Array.clone(me.catalogs);
        }

        me.catalogs = catalogs;
        config = Ext.apply({}, config);
        Ext.apply(me, config);

        me.callParent([config]);

        me.urlToken = me.contextType + '-' + me.id;

        Ext.each(me.catalogs, function (catalog, idx) {
            catalog.catalogCollection = me;
            me.catalogs[idx] = Ext.create('Taco.core.context.Catalog', catalog);
        });
    },

    getSiteId: function () {
        if (this.sites.length == 1) {
            return this.sites[0].getSiteId();
        }
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
        if (this.catalogs.length == 1) {
            return this.catalogs[0].getCatalogId();
        }
        return null;
    },

    updateProductPublishingMode: function (mode) {
        Ext.Ajax.request({
            url: '/admin/app/settings/publishing/product',
            method: 'POST',
            jsonData: {
                masterCatalogId: this.id,
                productPublishingMode: mode
            },
            success: function () {
                console.log('SUCCESS UPDATE PROD PUB ->', this.id, mode);
                //this.setProductPublishingMode(mode);
                this.productPublishingMode = mode;
            },
            scope: this
        });
    }
});