Ext.define('Taco.core.data.cache.ProxyCache', {
    extend: 'Taco.core.data.AjaxProxy',

    alias: 'proxy.taco-ajaxCacheProxy',
    cacheCallbackDefer: 0,
    isCacheProxy:true,
    statics: {
        cache: null,
        getTypedCache: function (model) {
            var key,
                typedCache;
            this.sharedCache = this.sharedCache || Ext.create('Ext.util.MixedCollection');
            key = Ext.isString(model) ? model : Ext.getDisplayName(model);
            typedCache = this.sharedCache.get(key);
            if (!typedCache) {
                typedCache = Ext.create('Ext.util.MixedCollection');
                this.sharedCache.add(key, typedCache);
            }
            return typedCache;

        }
    },
    getCache: function () {
        return Taco.core.data.cache.ProxyCache.getTypedCache(this.model);
    },
    getCacheItem: function (key) {
        return this.getCache().get(key);
    },
    insertCacheItem: function (key, value) {
        var cache = this.getCache();
        cache.removeAtKey(key);
        cache.add(key, value);
    },
    buildCacheKey: function (options) {
        var me = this,
            params = options.params || {},
            extraParams = me.extraParams,
            urlParams = options.urlParams,
            url = options.url || me.url,
            headers = {};


        // make sure params are a url encoded string and include any extraParams if specified
        if (Ext.isObject(params)) {
            params = Ext.Object.toQueryString(params);
        }

        if (Ext.isObject(extraParams)) {
            extraParams = Ext.Object.toQueryString(extraParams);
        }

        params = params + ((extraParams) ? ((params) ? '&' : '') + extraParams : '');

        urlParams = Ext.isObject(urlParams) ? Ext.Object.toQueryString(urlParams) : urlParams;


        if (me.contextLevel) {
            switch (me.contextLevel) {
            case 'c':
                headers.c = Taco.app.context.getCatalogId();
                headers.m = Taco.app.context.getMasterCatalogId();
                break;
            case 's':
                headers.s = Taco.app.context.getSiteId();
                headers.c = Taco.app.context.getCatalogId();
                headers.s = Taco.app.context.getMasterCatalogId();
                break;
            case 'm':
            case 'mc':
                headers.s = Taco.app.context.getMasterCatalogId();
                break;
            }
        } else {
            Taco.app.context.onBeforeAjaxRequest(null, headers);
        }


        headers = Ext.JSON.encode(headers);

        if (params) {
            url = Ext.urlAppend(url, params);
        }


        // allow params to be forced into the url
        if (urlParams) {
            url = Ext.urlAppend(url, urlParams);
        }

        if (headers) {
            url = Ext.urlAppend(url, headers);
        }


        return url;
    },
    doRequest: function (operation, callback, scope) {

        var me = this,
            writer = me.getWriter(),
            cache = me.getCache(),
            noCacheFlag = me.noCache,
            cacheKey,
            request,
            method,
            cachedResponse;

        if (operation.action === 'read') {
            me.noCache = false;
            request = me.buildRequest(operation);
            method = me.getMethod(request);

            if (operation.refresh !== true && operation.bypassCache !== true) {
                cacheKey = me.buildCacheKey(request);
            }

            me.noCache = noCacheFlag;

            if (me.noCache) {
                request.url = Ext.urlAppend(request.url, Ext.String.format("{0}={1}", me.cacheString, Ext.Date.now()));
            }

        } else {
            cache.clear();
            request = me.buildRequest(operation);
            method = me.getMethod(request);
        }

        if (operation.allowWrite()) {
            request = writer.write(request);
        }


        Ext.apply(request, {
            binary: me.binary,
            headers: me.headers,
            timeout: me.timeout,
            scope: me,
            callback: me.createRequestCallback(request, operation, callback, scope, cacheKey),
            method: method,
            disableCaching: false // explicitly set it to false, ServerProxy handles caching
        });


        if (method.toUpperCase() !== 'GET' && me.paramsAsJson) {
            // We need to copy the request here, because the params object is attached to
            // the request and may be accessed by other callers, since it doesn't really care how the
            // information is encoded, so we can't mutate it here.
            request = Ext.apply({
                jsonData: request.params
            }, request);
            delete request.params;
        }


        if (cacheKey) {
            cachedResponse = me.getCacheItem(cacheKey);
            if (cachedResponse) {
                
                Ext.defer(function () {
                    me.processResponse(true, operation, request, cachedResponse, callback, scope);
                }, me.cacheCallbackDefer);
                return request;
            }
        }


        Ext.Ajax.request(request);

        return request;
    },

    createRequestCallback: function (request, operation, callback, scope, cacheKey) {
        var me = this;

        return function (options, success, response) {
            if (cacheKey && success) {
                me.insertCacheItem(cacheKey, response);
            }
            me.processResponse(success, operation, request, response, callback, scope);
        };
    }
});