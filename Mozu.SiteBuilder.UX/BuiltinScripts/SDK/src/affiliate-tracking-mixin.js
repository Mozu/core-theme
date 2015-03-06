function deparam(querystring) {
    // remove any preceding url and split
    querystring = querystring || window.location.search;
    querystring = querystring.substring(querystring.indexOf('?') + 1).split('&');
    var params = {}, pair, d = decodeURIComponent, i;
    // march and parse
    for (i = querystring.length; i > 0;) {
        pair = querystring[--i].split('=');
        params[d(pair[0])] = d(pair[1]);
    }

    return params;
}

/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
    getItem: function(sKey) {
        if (!sKey) { return null; }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function(sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) { return false; }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function(sKey) {
        if (!sKey) { return false; }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: function() {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
        return aKeys;
    }
};

function isCartUrl(url) {
    return url.indexOf('/api/commerce/carts/current') !== -1;
}

var cookieName = 'MOZU_AFFILIATE_IDS';


module.exports = {
    mixin: function(interface) {
        interface.prototype.setAffiliateTrackingParameters = function(params) {
            // ['affiliateId','campaignId']
            // p/OAISHD?someOtherQP=123&utmsomething=456&affiliateId=abc
            var queryParams = deparam(window.location.search);
            // { someOtherQP: '123', utmsomething: 456, affiliateId: 'abc' }
            var newAffiliates = params.reduce(function(memo,param) {
                // {}, 'affiliateId'
                if (queryParams[param]) {
                    memo[param] = queryParams[param];
                }
                // { affiliateId: 'abc' }
                return memo;
            }, {});
            var existingAffiliateString = docCookies.getItem(cookieName);
            var existingAffiliates = JSON.parse(existingAffiliateString) || [];

            existingAffiliates.forEach(function(affiliate) {
                if (newAffiliates[affiliate.key]) {
                    affiliate.value = newAffiliates[affiliate.key];
                }
                delete newAffiliates[affiliate.key];
            });

            for (var remaining in newAffiliates) {
                if (newAffiliates.hasOwnProperty(remaining)) {
                    existingAffiliates.push({
                        key: remaining,
                        value: newAffiliates[remaining]
                    });
                }
            }

            var newAffiliateString = JSON.stringify(existingAffiliates);

            if (newAffiliateString !== existingAffiliateString) {
                docCookies.setItem(cookieName, newAffiliateString);
            }
            
        };

        var oldRequest = interface.prototype.request;

        interface.prototype.request = function(method, requestConf, conf) {
            var self = this;
            var operation = oldRequest.apply(this, arguments);
            var url = typeof requestConf === "string" ? requestConf : requestConf.url;
            var affiliates = docCookies.getItem(cookieName);
            try {
                affiliates = JSON.parse(affiliates);
            } catch (e) { }
            
            if (affiliates && affiliates.length > 0 && isCartUrl(url) && !this._hasUpdatedAffiliates) {
                return operation.then(function(originalResponse) {
                    return self.action('cart', 'addExtendedProperties', affiliates.reduce(function(memo, affiliate) {
                        memo[affiliate.key] = affiliate.value;
                        return memo;
                    },{})).then(function() {
                        self._hasUpdatedAffiliates = true;
                        return originalResponse;
                    })
                });
            } else {
                return operation;
            }

        };

    }
}