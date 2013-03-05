// BEGIN INTERFACE
var ApiInterface = function (context) {
    if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    //if (context.Host() === undefined) throw "API Base URL was not specified. Run Mozu.Host(host).Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    this.context = context;
};

ApiInterface.prototype = {
    request: function (method, url, conf) {
        var me = this;
        if (url.verbOverride) {
            method = url.verbOverride;
            url = url.url;
        }

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
    ApiInterface.prototype[fnName] = function (type, conf) {
        var me = this;
        return this.request(ApiInterface.basicOps[fnName], ApiReference.getUrlFor(fnName, type, conf, this.context), conf).then(function (rawJSON) {
            return ApiReference.tryCreateApiObject(type, rawJSON, me);
        });
    }
};
for (var i in ApiReference.basicOps) {
    if (ApiReference.basicOps.hasOwnProperty(i)) setOp(i);
}
// END INTERFACE

/*********/