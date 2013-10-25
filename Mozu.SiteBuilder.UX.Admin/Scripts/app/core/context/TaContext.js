/**
 * @class Taco.core.context.TaContext
 * @author Thomas Phipps the Wiener
 */

Ext.define('Taco.core.context.TaContext', {
    extend: 'Ext.util.Observable',
    requires: ['Taco.core.context.MasterCatalog', 'Taco.core.context.Site', 'Taco.core.context.Catalog', 'Taco.core.context.StoreItem'],
    urlToken: null,
    contextType: 't',
    name: 'All',
    masterCatalogs: null,
    
    currentCtx: null,
    constructor: function (config) {
        var me = this;
        var masterCatalogs = [];
        if (me.masterCatalogs) {
            masterCatalogs = Ext.Array.clone(me.masterCatalogs);
        }
        
        me.masterCatalogs = masterCatalogs;
        config = Ext.apply({}, config);
        Ext.apply(me, config);

        me.callParent([config]);

        Taco.core.StateManager.on('navigate', me.onNavigate, this);
        me.init(config);
        Ext.Ajax.on('beforerequest', me.onBeforeAjaxRequest, me);

    },
    isMultiSite:function() {
        var ret = false;
        Ext.each(this.masterCatalogs, function (sc) {
            if (sc.sites.length > 1) {
                ret = true;
            }
        });
        return ret;
    },
    isMultiMasterCatalog:function() {
        return this.masterCatalogs.length > 1;
    },
    isSingleSite:function() {
        return this.masterCatalogs.length == 1 && this.masterCatalogs[0].sites.length == 1;
    },
    toCookieString:function() {
        var ret = '',  sc = this.getCurrentMasterCatalog(), site = this.getCurrentSite();
        ret = 'tenant=' + this.id;
        if (sc) {
            ret += '&sitegroup=' + sc.id;
        }
        if (site) {
            ret += '&site=' + site.id;
        }
        return ret;
    },
    onBeforeAjaxRequest:function(conn, options, eOpts) {

        var headers = options.headers = options.headers || {}, sc = this.getCurrentMasterCatalog(), site = this.getCurrentSite();

        headers['x-vol-tenant'] = this.id || this.id;
        if (sc) {
            headers['x-vol-site-group'] = sc.id;
            headers['x-vol-master-catalog'] = sc.id;
        }
        if (site) {
            headers['x-vol-site'] = site.id;
            headers['x-vol-catalog'] = site.getCatalogId();
            headers['x-vol-site-group'] = sc.getMasterCatalogId();
            headers['x-vol-master-catalog'] = site.getMasterCatalogId();
        }
        if (options && options.operation && options.operation.headers) {
            Ext.apply(headers, options.operation.headers);
        }
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
            if (!me.fireEvent('beforecontextchange', cfg)) {
                return false;
            }


            
            if (Taco.core.AppState.contextRE.test(smState.uri)) {
                newUrl = smState.uri.replace(Taco.core.AppState.contextRE, cfg.urlToken);
            } else {
                newUrl = cfg.urlToken + '/' + smState.uri;
            }
            if (navigate !== false) {
                Taco.core.StateManager.attemptNavigate(newUrl);
            } else {
                Taco.core.StateManager.addState(newUrl);
            }

            me.currentCtx = cfg;
            me.setCookie();

            me.fireEvent('contextchange', cfg);
        }
        return true;
    },
    setCookie: function () {
        var name = 'SBCONTEXT', value = this.toCookieString(), expires = new Date(2050, 1, 1), path = '/', domain =  null, secure = false;
        //ext excapes multi value cookies
        //Ext.util.Cookies.set('SBCONTEXT', cookieVal, new Date(2050, 1, 1));
        document.cookie = name + "=" + value + ((expires === null) ? "" : ("; expires=" + expires.toGMTString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
        document.cookie = name + "2=" + value +((expires === null) ? "" : ("; expires=" + expires.toGMTString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");

        

    },
    getCurrent: function () {
        return this.getCurrentContext();
    },

    getCurrentContext: function () {
        return this.currentCtx;
    },

    getTenantId: function () {
        return this.id;
    },

    getSiteId: function () {
        if (this == this.getCurrentContext()) {
            if (this.masterCatalogs.length == 1) {
                return this.masterCatalogs[0].getSiteId();
            }
            return null;
        }
        return this.getCurrentContext().getSiteId();
    },
   
    getMasterCatalogId: function () {
        if (this == this.getCurrentContext()) {
            if (this.masterCatalogs.length == 1) {
                return this.masterCatalogs[0].getMasterCatalogId();
            }
            return null;
        }
        return this.getCurrentContext().getMasterCatalogId();
    },

    getStore: function(copy) {
        var me = this,
            store = me.store,
            data = [];

        if (copy !== true && store) {
            return store;
        }
        data.push(me);

        Ext.each(me.masterCatalogs, function(sc) {
            data.push(sc);

            Ext.each(sc.sites, function(site) {
                site.parentCollectionID = sc.id;
                data.push(site);
            });
        });

        store = Ext.create('Ext.data.Store', {
            model: 'Taco.core.context.StoreItem',
            data:data
        });
        
        if (copy !== true) {
            me.store = store;
        }
        return store;
    },
    

    init: function (data) {
        var me = this;
        me.urlToken = me.contextType +'-'+ data.id;
        me.currentCtx = me;
        
        Ext.each(data.masterCatalogs, function(sc,idx) {
            me.masterCatalogs[idx] = Ext.create('Taco.core.context.MasterCatalog', sc);

        });
        if (this.isSingleSite()) {
            me.currentCtx = this.masterCatalogs[0].sites[0];
        }else if (!this.isMultiMasterCatalog()) {
            me.currentCtx = this.masterCatalogs[0];
        }
        this.setCookie();
    },

    setCurrentSite: function (id) {
        var me = this, newSite = me.findSite(id);

        return me.setCurrentContext(newSite);
    },

    setCurrentMasterCatalog: function (id) {
        var me = this, newCol = this.findMasterCatalog(id);
        return me.setCurrentContext(newCol);
       
    },

    getCurrentMasterCatalog: function () {
        var cc = this.getCurrentContext();
        if (cc.contextType == 'c') {
            return cc;
        }
        if (cc.contextType == 's') {
            return cc.getMasterCatalog();
        }
        if (this.masterCatalogs.length == 1) {
            return this.masterCatalogs[0];
        }
        return null;
    },

    getCurrentSite: function () {
        var cc = this.getCurrentContext(), sc = this.getCurrentMasterCatalog();
        if (cc.contextType == 's') {
            return cc;
        }
        if (sc != null) {
            if (sc.sites.length == 1) {
                return sc.sites[0];
            }
        }
        
        return null;
    },
    findMasterCatalog: function (id) {
        var me = this,
            foundCol;
        Ext.each(me.masterCatalogs, function (sc) {
            if (sc.id === id) {
                foundCol = sc;
            }
        });
        return foundCol;
    },

    findSite: function (id) {
        var me = this,
            foundSite;
        Ext.each(me.masterCatalogs, function (sc) {
            Ext.each(sc.sites, function (site) {
                if (id === site.id) {
                    foundSite = site;
                }
            });
        });
        return foundSite;
    },
    
    findCatalog: function (id) {
        var me = this,
            foundCatalog;
        Ext.each(me.masterCatalogs, function (sc) {
            Ext.each(sc.catalogs, function (catalog) {
                if (id === catalog.id) {
                    foundCatalog = catalog;
                }
            });
        });
        return foundCatalog;
    },

    /**
     * Configuration objects often change based on context; this method exists to transform those objects based on a contextConf property.
     *
     *    {
     *        split: true,
     *        contextConf:  {
     *                         c: {
     *                                split: false
     *                            }
     *                      }
     *    }
     *
     *
     * @param Object obj The object to transform based on context. If it contains a contextConf property, this function will transform the object. If not, nothing will happen.
     */
    forCurrentContext: function (obj) {
        var contextType = this.getCurrent().contextType;
        if (obj.contextConf && obj.contextConf[contextType]) {
            obj = Ext.apply({}, obj, obj.contextConf[contextType]);
        }
        //return a shallow clone of the top object
        return Ext.apply({}, obj);
    }

});