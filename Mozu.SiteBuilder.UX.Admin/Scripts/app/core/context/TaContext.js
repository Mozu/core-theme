/**
 * @class Taco.core.context.TaContext
 * @author Thomas Phipps the Wiener
 */

Ext.define('Taco.core.context.TaContext', {
    extend: 'Ext.util.Observable',
    requires: ['Taco.core.context.SiteCollection', 'Taco.core.context.Site'],
    urlToken: null,
    contextType: 't',
    name: 'All',
    
    siteCollections: null,
    
    currentCtx: null,
    constructor: function (config) {
        var me = this;
        me.siteCollections = Ext.Array.clone(me.siteCollections || []);
        config = Ext.apply({}, config);
        Ext.apply(me, config);

        me.callParent([config]);

        Taco.core.StateManager.on('navigate', me.onNavigate, this);
        me.init(config);
    },

    onNavigate: function (state) {
        var ulrToken = state.metaData.ctx, recordId = this.getStore().find('urlToken', ulrToken),
            record = this.getStore().getAt(recordId);

        this.setCurrentContext(record.raw, false);
    },

    setCurrentContext: function (cfg, navigate) {
        var me = this,
            smState = Taco.core.StateManager.getCurrentState(),
            newUrl = '';

        if (Ext.isString(cfg)) {
            //do stuff. // *** Great work, Thom
        }
        
        if (this.currentCtx != cfg) {
            if (!me.fireEvent('contextChange', me, cfg)) {
                return false;
            }
        }

        if (navigate !== false) {
            if (Taco.core.AppState.contextRE.test(smState.uri)) {
                newUrl = smState.uri.replace(Taco.core.AppState.contextRE, cfg.urlTgetCurrentSiteCollectionoken);
            } else {
                newUrl = cfg.urlToken + '/' + smState.uri;
            }
            Taco.core.StateManager.attemptNavigate(newUrl);
        }
        
        me.currentCtx = cfg;
        
        return true;
    },

    getCurrent: function () {
        return this.getCurrentContext();
    },

    getCurrentContext: function () {
        return this.currentCtx;
    },

    getTenantId: function () {
        return this.tenantId;
    },

    getSiteId: function () {
        if (this == this.getContext()) {
            if (this.siteCollections.length == 1) {
                return this.siteCollections[0].getSiteId();
            }
            return null;
        }
        return this.getContext().getSiteId();
    },

    getSiteGroupId: function () {
        if (this == this.getContext()) {
            if (this.siteCollections.length == 1) {
                return this.siteCollections[0].getSiteId();
            }
            return null;
        }
        return this.getContext().getSiteId();
    },

    getStore: function() {
        var me = this,
            data = [];

        if (me.store) {
            return me.store;
        }

        data.push(me);
        Ext.each(me.siteCollections, function (sc) {
            data.push(sc);
            Ext.each(sc.sites, function (site) {
                site.parentCollectionID = sc.id;
                data.push(site);
            });
        });

        me.store = Ext.create('Ext.data.Store', {
            fields: [
                'name',
                'contextType',
                'urlToken',
                { name: 'itemid', type: 'int' }
                // *** Below field is not needed if this store can guarantee the order of its records
                // { name: 'parentCollectionID', type: 'int', defaultValue: NaN } // *** ID of parent SiteCollection (for Sites only)
            ],
            data:data
        });

        return me.store;
    },

    init: function (data) {
        var me = this;
        me.urlToken = me.contextType +':'+ data.tenantId;
        me.currentCtx = me;
        
        Ext.each(data.siteCollections, function(sc,idx) {
            me.siteCollections[idx] = Ext.create('Taco.core.context.SiteCollection', sc);

        });
    },

    setCurrentSite: function (id) {
        var me = this, newSite = me.findSite(id);

        return  me.setCurrentContext(newCol);
    },

    setCurrentSiteCollection: function (id) {
        var me = this, newCol = this.findSiteCollection(id);
        return me.setCurrentContext(newCol);
       
    },

    getCurrentSiteCollection: function () {
        var cc = this.getCurrentContext();
        if (cc.contextType == 'c') {
            return cc;
        }
        if (cc.contextType == 's') {
            return cc.getSiteGroup();
        }
        if (this.siteCollections.length == 1) {
            return this.siteCollections;
        }
        return null;
    },

    getCurrentSite: function () {
        var cc = this.getCurrentContext(), sc = getCurrentSiteCollection;
        if (cc.contextType == 's') {
            return cc;
        }
        if (cc.contextType == 's') {
            return cc.getSiteGroup();
        }
        if (sc!= null) {
            if (sc.sites.length == 1) {
                return sc;
            }
        }
        return null;
    },
    findSiteCollection: function (id) {
        var me = this,
            foundCol;
        Ext.each(me.siteCollections, function (sc) {
            if (sc.id === id) {
                foundCol = sc;
            }
        });
        return foundCol;
    },

    findSite: function (id) {
        var me = this,
            foundSite;
        Ext.each(me.siteCollections, function (sc) {
            Ext.each(sc.sites, function (site) {
                if (id === site.id) {
                    foundSite = site;
                }
            });
        });
        return foundSite;
    }

});