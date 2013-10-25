/*
 * This store's API, as exposed by the Mozu SDK. EXCELSIOR!
 *
 */

define(['sdk', 'jquery'], function (Mozu, $) {
    var apiConfig = require.mozuData('apiconfig');
    Mozu.setServiceUrls(apiConfig.Urls);
    var headers = apiConfig.Headers,
        api = Mozu.Tenant(headers['x-vol-tenant'])
           .MasterCatalog(headers['x-vol-master-catalog'])
           .Site(headers['x-vol-site'])
           .AppClaims(headers['x-vol-app-claims'])
           .UserClaims(headers['x-vol-user-claims'])
        //   .BypassCache(headers['x-vol-bypass-cache'])
           .api();
    api.on('error', function (badPromise, xhr, requestConf) {
        var e = "Error communicating with Mozu API";
        if (requestConf && requestConf.url) e += (" at " + requestConf.url);
        window.console && console.error(e, badPromise, xhr);
    });

    return api;

    // we would have also accepted Mozu.Store(headers) but that's less showoffy.
});