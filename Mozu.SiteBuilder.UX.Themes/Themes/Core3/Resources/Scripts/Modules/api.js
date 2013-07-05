/*
 * This store's API, as exposed by the Mozu SDK. EXCELSIOR!
 *
 */

define(['sdk'], function (Mozu) {
    var apiConfig = JSON.parse(document.getElementsByTagName('head')[0].getAttribute('data-api-config'));
    Mozu.setServiceUrls(apiConfig.urls);
    var headers = apiConfig.header,
        api = Mozu.Tenant(headers['x-vol-tenant'])
           .SiteGroup(headers['x-vol-site-group'])
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