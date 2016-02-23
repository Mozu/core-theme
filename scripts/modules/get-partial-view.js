/**
 * What if I told you that server-side Hypr can be client-side Hypr.
 * Only depends on jquery for AJAX, so that can be subbed in later
 * with something smaller.
 * Only depends on modules/api to turn jQuery deferred promises into
 * actually composable promises.
 * Only depends on modules/api to get access to compliant promises.
 * Later when we shim ES6/promise that can also go away.
 */

define(['modules/jquery-mozu', 'modules/api'], function($, api) {
    var PARTIAL_PARAM_NAME = "_mz_partial";

    function setPartialTrue(url) {
        var prefixChar = !~url.indexOf('?') ? '?' : '&';
        return url + prefixChar + PARTIAL_PARAM_NAME + "=true";
    }

    function removePartialParam(url) {
        return url.replace(
            RegExp('[&\\?]' + PARTIAL_PARAM_NAME + '=true', 'g'),
            '');
    }

    return function getPartialView(url, partialTemplate) {

        var deferred = api.defer();

        function handleSuccess(body, __, res) {
            var canonical = res.getResponseHeader('x-vol-canonical-url');
            if (canonical) {
                canonical = removePartialParam(canonical);
            }
            deferred.resolve({
                canonicalUrl: canonical,
                body: body
            });
        }

        function handleError(error) {
            deferred.reject(error);
        }

        $.ajax({
            method: 'GET',
            url: setPartialTrue(removePartialParam(url)),
            dataType: 'html',
            headers: {
                'x-vol-alternative-view': partialTemplate
            }
        }).then(handleSuccess, handleError);

        return deferred.promise;

    };

});