/**
 * Creates an interface object to the Mozu store's Web APIs. It pulls in the Mozu
 * JavaScript SDK and initializes it with the current store's context values
 * (tenant, catalog and store IDs, and authorization tickets).
 */

define(['sdk', 'jquery', 'hyprlive'], function (Mozu, $, Hypr) {
    var apiConfig = require.mozuData('apicontext');
    Mozu.setServiceUrls(apiConfig.urls);
    var headers = apiConfig.headers,
        api = Mozu.Tenant(headers['x-vol-tenant'])
             .MasterCatalog(headers['x-vol-master-catalog'])
             .Site(headers['x-vol-site'])
             .AppClaims(headers['x-vol-app-claims'])
             .UserClaims(headers['x-vol-user-claims'])
             .api();
    if (Hypr.getThemeSetting('useDebugScripts') || require.mozuData('pagecontext').isDebugMode) {
        api.on('error', function (badPromise, xhr, requestConf) {
            var e = "Error communicating with Mozu API";
            if (requestConf && requestConf.url) e += (" at " + requestConf.url);
            var correlation = xhr && xhr.getResponseHeader && xhr.getResponseHeader('x-vol-correlation');
            if (correlation) e += " --- Correlation ID: " + correlation;
            window && window.console && console.error(e, badPromise, xhr);
        });
    }
    return api;
});