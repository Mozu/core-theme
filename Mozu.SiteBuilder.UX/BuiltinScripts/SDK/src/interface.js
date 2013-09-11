// BEGIN INTERFACE
var ApiInterface = (function () {

    var ApiInterfaceConstructor = function (context) {
        if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        //if (context.Host() === undefined) throw "API Base URL was not specified. Run Mozu.Host(host).Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
        this.context = context;
    };

    ApiInterfaceConstructor.prototype = {
        constructor: ApiInterfaceConstructor,
        request: function (method, requestConf, conf) {
            var me = this,
                url = typeof requestConf === "string" ? requestConf : requestConf.url;
            if (requestConf.verbOverride)
                method = requestConf.verbOverride;

            var deferred = utils.when.defer();

            var data;
            if (requestConf.overridePostData) {
                data = requestConf.overridePostData;
            } else  if (conf && !requestConf.noBody) {
                data = conf.data || conf;
            }

            var xhr = utils.ajax(method, url, this.context.asObject("x-vol-"), data, function (rawJSON) {
                // update context with response headers
                me.fire('success', rawJSON, xhr, requestConf);
                deferred.resolve(rawJSON, xhr);
            }, function (error) {
                deferred.reject(error, xhr, url);
            });

            var cancelled = false,
                canceller = function () {
                    cancelled = true;
                    xhr.abort();
                    deferred.reject("Request cancelled.")
                };

            this.fire('request', xhr, canceller, deferred.promise, requestConf, conf);

            deferred.promise.otherwise(function (error) {
                var res;
                if (!cancelled) {
                    me.fire('error', error, xhr, requestConf);
                    throw error;
                }
            });

            
            return deferred.promise;
        },
        action: function (type, actionName, conf) {
            var me = this,
                requestConf = ApiReference.getRequestConfig(actionName, type, conf, this.context);
            return this.request(ApiReference.basicOps[actionName], requestConf, conf).then(function (rawJSON) {
                var newObj = me.createSync(requestConf.returnType || type, rawJSON);
                delete newObj.unsynced;
                return newObj;
            });
        },
        all: function () {
            return utils.when.join.apply(utils.when, arguments);
        },
        steps: function () {
            var args = Object.prototype.toString.call(arguments[0]) === "[object Array]" ? arguments[0] : Array.prototype.slice.call(arguments);
            return utils.pipeline(Array.prototype.slice.call(args));
        }
    };
        var setOp = function (fnName) {
            ApiInterfaceConstructor.prototype[fnName] = function (type, conf, isRemote) {
            return this.action(type, fnName, conf, isRemote);
        };
    };
    for (var i in ApiReference.basicOps) {
        if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
    }

    // add createSync method for a different style of development
    ApiInterfaceConstructor.prototype.createSync = function (type, conf) {
        var newApiObject = ApiReference.tryCreateApiObject(type, conf, this);
        newApiObject.unsynced = true;
        this.fire('spawn', newApiObject);
        return newApiObject;
    }

    utils.addEvents(ApiInterfaceConstructor);

    return ApiInterfaceConstructor;
}());

// END INTERFACE

/*********/