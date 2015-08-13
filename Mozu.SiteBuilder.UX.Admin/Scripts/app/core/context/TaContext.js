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
        Ext.Ajax.on('requestexception', function (conn, resp) {
            var corId,
                logzuUrl,
                url,
                errObj;

            //occurs on abort of xhr
            if (!resp || !resp.getResponseHeader) {
                return;
            }
            corId = resp.getResponseHeader('x-vol-correlation');
            // TODO pull in this environment's logzu url...

            if (corId != undefined) {
                url = config.logzuUrl + '#trace/' + corId;
            }
            console.error('AJAX Exception', 'View in Logzu', url);

            // commenting this out since its causing two error messages to fire in the app. 
            // need to add error messaging for the specific use cases rather than globally.
            //errObj = Ext.decode(resp.responseText);
            //if (errObj && errObj.message) {
            //    Taco.app.fireEvent('setmessage', errObj.message, 'error');
            //}

        }, this);

    },
    formatCurrency: function (value) {
        return this.masterCatalogs[0].formatCurrency(value);
    },

    formatCurrencyFromCode: function (code, value) {
        var cur = this.currencies[code.toLowerCase()];
        if (!cur) {
            Ext.warn({
                level: 'warn'
            }, 'missing currency code[' + code + ']');
            return Ext.util.Format.currency(value, '$', 2);
        }
        return Ext.util.Format.currency(value, cur.symbol, cur.significantDecimalDigits);

    },
    isMultiSite: function () {
        var ret = false;
        Ext.each(this.masterCatalogs, function (sc) {
            if (sc.sites.length > 1) {
                ret = true;
            }
        });
        return ret;
    },
    isMultiMasterCatalog: function () {
        return this.masterCatalogs.length > 1;
    },
    isSingleSite: function () {
        return this.masterCatalogs.length == 1 && this.masterCatalogs[0].sites.length == 1;
    },
    toCookieString: function () {
        var ret = '',
            sc = this.getMasterCatalog(),
            site = this.getSite();
        ret = 'tenant=' + this.id;
        if (sc) {
            ret += '&mastercatalog=' + sc.id;
        }
        if (site) {
            ret += '&site=' + site.id;
        }
        return ret;
    },
    onBeforeAjaxRequest: function (conn, options) {

        var headers = options.headers = options.headers || {},
            volHeaders = {
                'x-vol-tenant': this.id,
                'x-vol-master-catalog': this.getMasterCatalogId(),
                'x-vol-catalog': this.getCatalogId(),
                'x-vol-site': this.getSiteId(),
                'x-vol-locale': this.getCurrent().localeCode ,
                'x-vol-currency': this.getCurrent().currencyCode
            };


        Ext.Object.each(volHeaders, function (key, value) {
            if (value) {
                headers[key] = value;
            }
        });
        if (options && options.operation && options.operation.headers) {
            Ext.apply(headers, options.operation.headers);
        }
    },
    onNavigate: function (state) {
        var ulrToken = state.metaData.ctx,
            recordId = this.getStore().find('urlToken', ulrToken),
            record = this.getStore().getAt(recordId);
        if (record) {
            this.setCurrentContext(record.raw, false);
        }
    },

    setCurrentContext: function (cfg, navigate, replaceHistory) {
        var me = this,
            smState = Taco.core.StateManager.getCurrentState(),
            newUrl = '';

        

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
                Taco.core.StateManager.attemptNavigate(newUrl, undefined, replaceHistory);
            } else {
                Taco.core.StateManager.addState(newUrl, undefined, replaceHistory);
            }

            me.currentCtx = cfg;
            me.setCookie();

            me.fireEvent('contextchange', cfg);
        }
        return true;
    },
    setCookie: function () {
        return;

        //remving cookie setting... relaying on gosite.
        //var name = 'SBCONTEXT', value = this.toCookieString(), expires = new Date(2050, 1, 1), path = '/', domain =  null, secure = false;

        //document.cookie = name + "=" + value + ((expires === null) ? "" : ("; expires=" + expires.toGMTString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");
        //document.cookie = name + "2=" + value +((expires === null) ? "" : ("; expires=" + expires.toGMTString())) + ((path === null) ? "" : ("; path=" + path)) + ((domain === null) ? "" : ("; domain=" + domain)) + ((secure === true) ? "; secure" : "");


    },
    getCurrent: function () {
        return this.getCurrentContext();
    },
    getCatalogId: function () {
        if (this == this.getCurrentContext()) {
            return null;
        }
        return this.getCurrentContext().getCatalogId();

    },
    getCurrentContext: function () {
        return this.currentCtx;
    },

    getTenantId: function () {
        return this.id;
    },

    getSiteId: function () {
        if (this == this.getCurrentContext()) {

            return null;
        }
        return this.getCurrentContext().getSiteId();
    },

    getContextAtLevel: function (level) {
        var cur = this.getCurrentContext();
        if (cur.contextType === level) {
            return cur;
        }
        if (level == 's') {
            switch (cur.contextType) {
            case 't':
                return cur.masterCatalogs[0].sites[0];
            default:
                return cur.sites[0];
            }
        }
        if (level === 'c') {
            switch (cur.contextType) {
            case 't':
                return cur.masterCatalogs[0].catalogs[0];
            case 'm':
                return cur.catalogs[0];
            case 's':
                return cur.catalog;
            }
        }
        if (level === 'm') {
            switch (cur.contextType) {
            case 't':
                return cur.masterCatalogs[0];
            case 'c':
                return cur.masterCatalog;
            case 's':
                return cur.masterCatalog;
            }
        }
        return this;
    },

    getMasterCatalogId: function () {
        if (this === this.getCurrentContext()) {
            return null;
        }
        return this.getCurrentContext().getMasterCatalogId();
    },

    getStore: function (copy) {
        var me = this,
            store = me.store,
            data = [];

        if (copy !== true && store && !store.isFiltered()) {
            return store;
        }
        data.push(me);

        Ext.each(me.masterCatalogs, function (sc) {
            data.push(sc);

            Ext.each(sc.catalogs, function (catalog) {
                data.push(catalog);
                Ext.each(catalog.sites, function (site) {
                    data.push(site);
                });
            });
        });

        store = Ext.create('Ext.data.Store', {
            model: 'Taco.core.context.StoreItem',
            data: data
        });

        if (copy !== true) {
            me.store = store;
        }
        return store;
    },


    init: function (data) {
        var me = this;
        me.urlToken = me.contextType + '-' + data.id;
        me.currentCtx = me;
        me.currencyLookup = {};

        Ext.each(data.masterCatalogs, function (sc, idx) {
            me.masterCatalogs[idx] = Ext.create('Taco.core.context.MasterCatalog', sc);

        });

        if (this.isSingleSite()) {
            me.currentCtx = this.masterCatalogs[0].sites[0];
        } else if (!this.isMultiMasterCatalog()) {
            me.currentCtx = this.masterCatalogs[0];
        }
        this.setCookie();
    },

    setCurrentSite: function (id) {
        var me = this,
            newSite = me.findSite(id);

        return me.setCurrentContext(newSite);
    },

    setCurrentMasterCatalog: function (id) {
        var me = this,
            newCol = this.findMasterCatalog(id);
        return me.setCurrentContext(newCol);

    },

    getCatalog: function () {
        var cc = this.getCurrentContext();
        if (cc === this) {
            return null;
        }
        return cc.getCatalog();
    },
    getSite: function () {
        var cc = this.getCurrentContext();
        if (cc === this) {
            return null;
        }
        return cc.getSite();
    },
    getMasterCatalog: function () {

        var cc = this.getCurrentContext();
        if (cc == this) {
            return null;
        }
        return cc.getMasterCatalog();
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

    findSitesByCatalog: function (id) {
        var me = this,
            foundSites = [];
        Ext.each(me.masterCatalogs, function (sc) {
            Ext.each(sc.sites, function (site) {
                if (id === site.getCatalogId()) {
                    foundSites.push(site);
                }
            });
        });
        return foundSites;
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
            obj = Ext.apply({}, obj.contextConf[contextType], obj);
        }

        //return a shallow clone of the top object
        return Ext.apply({}, obj);
    },
    isContentPublishingEnabled: function () {
        return this.contentPublishingEnabled;
    },
    updateContentPublishingMode: function (value) {
        this.publishingEnabled = value === 'Pending';

        Ext.Ajax.request({
            url: '/admin/app/cmspublishing/enablePublishing',
            method: 'POST',
            jsonData: {
                context: {},
                publishingEnabled: this.publishingEnabled
            }
        });
    }

});