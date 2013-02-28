// BEGIN INTERFACE
var ApiInterface = function (context) {
    if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    //if (context.Host() === undefined) throw "API Base URL was not specified. Run Mozu.Host(host).Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    this.context = context;
};


var basicOps = {
    get: 'GET',
    update: 'PUT',
    create: 'POST',
    remove: 'DELETE'
};
ApiInterface.prototype = {
    request: function (method, url, conf) {
        conf = conf || {};
        if (url.verbOverride) {
            method = url.verbOverride;
            url = url.url;
        }

        var deferred = utils.when.defer();

        var xhr = utils.ajax(method, url, this.context.headers(), conf.data, function (rawJSON) {
            deferred.resolve(rawJSON, xhr);
        }, function (error) {
            deferred.reject(error, xhr);
        });

        return deferred.promise;
    }
};
var setOp = function(fnName, verb) {
    ApiInterface.prototype[fnName] = function (type, conf) {
        var me = this;
        return this.request(verb, ApiReference.getUrlFor(fnName, type, conf, this.context), conf).then(function (rawJSON) {
            return ApiReference.tryCreateApiObject(type, rawJSON, me);
        });
    }
};
for (var i in basicOps) {
    if (basicOps.hasOwnProperty(i)) setOp(i, basicOps[i]);
}
// END INTERFACE

/*********/