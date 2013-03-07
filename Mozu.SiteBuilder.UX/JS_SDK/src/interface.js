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
        if (conf) {
            data = conf.data || conf;
        }

        var xhr = utils.ajax(method, url, this.context.asObject("x-vol-"), data, function (rawJSON) {
            deferred.resolve(rawJSON, xhr);
        }, function (error) {
            deferred.reject(error, xhr, url);
        });

        deferred.promise.otherwise(function (failedXhr) {
            me.onError(deferred.promise, failedXhr, url)
        });

        return deferred.promise;
    },
    all: function () {
        return utils.when.join.apply(utils.when, arguments);
    },
    steps: function () {
        return utils.pipeline(Array.prototype.slice.call(arguments));
    },
    onError: function (badPromise, xhr, url) {
        window.console && console.error("Error communicating with Mozu API at " + url, badPromise, xhr);
    }
};
var setOp = function(fnName) {
    ApiInterface.prototype[fnName] = function (type, conf, isRemote) {
        var me = this,
            fulfill = function (rawJSON) {
            return ApiReference.tryCreateApiObject(type, rawJSON, me);
        };
        isRemote = isRemote === false ? false : true;
        return isRemote ? this.request(ApiReference.basicOps[fnName], ApiReference.getRequestConfig(fnName, type, conf, this.context), conf).then(fulfill) :
                          utils.when(utils.extend(conf, { unsynced: true }), fulfill);
    }
};
for (var i in ApiReference.basicOps) {
    if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
}
// END INTERFACE

/*********/