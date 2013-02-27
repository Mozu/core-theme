// BEGIN INTERFACE
var ApiInterface = function (context) {
    if (context.Tenant() === undefined) throw "No tenant was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.Site() === undefined) throw "No site was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.SiteGroup() === undefined) throw "No site group was specified. Run Mozu.Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    if (context.Host() === undefined) throw "API Base URL was not specified. Run Mozu.Host(host).Tenant(tenantId).SiteGroup(siteGroupId).Site(siteId).";
    this.context = context;
};


var basicOps = {
    get: 'GET',
    update: 'PUT',
    create: 'POST',
    'delete': 'DELETE'
};
ApiInterface.prototype = {
    request: function (method, url, conf) {
        conf = conf || {};
        var ajaxConf = {
            dataType: 'json',
            contentType: 'application/json',
            headers: this.context.headers(),
            url: this.context.Host() + url
        };

        if (conf.data) ajaxConf.data = conf.data;

        return utils.when(utils.ajax(ajaxConf));
    }
};
var setOp = function(fnName, verb) {
    ApiInterface.prototype[fnName] = function (type, conf) {
        return this.request(verb, ApiReference.getUrlFor(fnName, type, conf, this.context), conf);
    };
};
for (var i in basicOps) {
    if (basicOps.hasOwnProperty(i)) setOp(i, basicOps[i]);
}
// END INTERFACE

/*********/