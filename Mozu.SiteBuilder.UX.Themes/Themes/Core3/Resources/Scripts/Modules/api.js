/*
 * This store's API, as exposed by the Mozu SDK. EXCELSIOR!
 *
 */

define(['sdk'], function (Mozu) {
    Mozu.setServiceUrls(window.zapiConfig.urls);
    var headers = window.zapiConfig.header,
        api = Mozu.Tenant(headers['x-vol-tenant'])
           .SiteGroup(headers['x-vol-site-group'])
           .Site(headers['x-vol-site'])
           .AppClaims(headers['x-vol-app-claims'])
           .UserClaims(headers['x-vol-user-claims'])
        //   .BypassCache(headers['x-vol-bypass-cache'])
           .api();
    api.on('error', function (badPromise, xhr, requestConf) {
        window.console && console.error("Error communicating with Mozu API at " + requestConf.url, badPromise, xhr);
    });

    return api;

    // we would have also accepted Mozu.Store(headers) but that's less showoffy.
});