/*
 * This store's API, as produced by the Mozu SDK. RAW!
 *
 */

define(['sdk'], function (Mozu) {
    Mozu.setServiceUrls(window.zapiConfig.urls);
    var headers = window.zapiConfig.header;
    return Mozu.Tenant(headers['x-vol-tenant'])
               .SiteGroup(headers['x-vol-site-group'])
               .Site(headers['x-vol-site'])
               .AppClaims(headers['x-vol-app-claims'])
               .UserClaims(headers['x-vol-user-claims'])
            //   .BypassCache(headers['x-vol-bypass-cache'])
               .api();

    // we would have also accepted Mozu.Store(headers) but that's less showoffy.
});