// BEGIN INTERFACE
var ApiInterface = function (context) {
    if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    //if (context.Host() === undefined) throw "API Base URL was not specified. Run Mozu.Host(host).Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    this.context = context;
};

ApiInterface.prototype = {
    request: function (method, requestConf, conf) {
        var me = this,
            url = typeof requestConf === "string" ? requestConf : requestConf.url;
        if (requestConf.verbOverride)
            method = requestConf.verbOverride;

        var deferred = utils.when.defer();

        var data;
        if (conf && !requestConf.noBody) {
            data = conf.data || conf;
        }

        var xhr = utils.ajax(method, url, this.context.asObject("x-vol-"), data, function (rawJSON) {
            // update context with response headers
            deferred.resolve(rawJSON, xhr);
        }, function (error) {
            deferred.reject(error, xhr, url);
        });

        this.fire('request', xhr, deferred.promise, requestConf);

        deferred.promise.otherwise(function (error) {
            var res;
            if (!cancelled) {
                me.fire('error', error, xhr, requestConf);
                throw error;
            }
        });

        var cancelled = false;
        deferred.promise.cancel = function () {
            cancelled = true;
            xhr.abort();
            deferred.reject("Request cancelled.")
        };

        return deferred.promise;
    },
    action: function(type, actionName, conf, isRemote) {
        var me = this,
            fulfill = function (rawJSON) {
                return ApiReference.tryCreateApiObject(type, rawJSON, me);
            };
        isRemote = isRemote === false ? false : true;
        if (isRemote) {
            var cancelablePromise = this.request(ApiReference.basicOps[actionName], ApiReference.getRequestConfig(actionName, type, conf, this.context), conf),
                completedPromise = cancelablePromise.then(fulfill);
            completedPromise.cancel = cancelablePromise.cancel;
            return completedPromise;
        } else {
            return utils.when(conf, fulfill);
        }
    },
    all: function () {
        return utils.when.join.apply(utils.when, arguments);
    },
    steps: function () {
        var args = Object.prototype.toString.call(arguments[0]) === "[object Array]" ? arguments[0] : Array.prototype.slice.call(arguments);
        return utils.pipeline(Array.prototype.slice.call(args));
    }
};
var setOp = function(fnName) {
    ApiInterface.prototype[fnName] = function (type, conf, isRemote) {
        return this.action(type, fnName, conf, isRemote);
    };
};
for (var i in ApiReference.basicOps) {
    if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
}

utils.addEvents(ApiInterface);

// END INTERFACE

/*********/