// BEGIN REFERENCE
var ApiReference = (function () {

    var ApiObject = function (type, data, iapi) {
        this.data = data;
        this.api = iapi;
        this.type = type;
    }

    ApiObject.prototype = {
        action: function (actionName, data) {
            var me = this;
            var url = ApiReference.getUrlFor(actionName, this.type, this.data, this.api.context);
            return this.api.request(null, url, data || this.data).then(function (rawJSON) {
                return ApiReference.tryCreateApiObject(me.type, rawJSON, me.api);
            });
        },
        getAvailableActions: function () {
            return ApiReference.getActionsFor(this.type);
        }
    };

    var genericQueryTpt = '{?_*}';
    var pub = {

        urls: {
        "product": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/products/",
        "cart": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Cart.WebApi/carts/",
        "user": "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/users/",
        "order": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Order.WebApi/orders/",
        "search": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/productsearch/",
        "cms": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/documents/"
        },

        getActionsFor: function(shortcutName) {
            if (!urlShortcuts[shortcutName]) return false;
            var actions = [];
            for (var a in urlShortcuts[shortcutName]) {
                actions.push(a);
            }
            return actions;
        },

        getUrlFor: function(operation, shortcutName, conf, context) {
            var shortcut = urlShortcuts[shortcutName];
            if (!shortcut) return shortcutName;
            if (shortcut[operation]) shortcut = shortcut[operation];
            if (!shortcut) throw "No known URL for '" + shortcutName + "' type.";
            if (typeof shortcut === "string") return shortcut;
            var returnUrl;
            if (shortcut.url) {
                returnUrl = shortcut.url;
            } else if (shortcut.template) {
                // cache templates lazily
                if (typeof shortcut.template === "string") shortcut.template = utils.uritemplate.parse(shortcut.template);
                var tptData = {};
                if (typeof conf === "string") {
                    if (!shortcut.shortcutParam) throw "No shortcut parameter available for '" + shortcutName + "'. Please supply a configuration object instead of '" + conf + "'.";
                    tptData[shortcut.shortcutParam] = conf;
                } else if (conf) {
                    utils.extend(tptData, conf.query || conf);
                }
                if (shortcut.defaults) tptData = utils.extend({}, shortcut.defaults, tptData);
                returnUrl = shortcut.template.expand(utils.extend({ _: tptData }, tptData));
            } else {
                throw "URLs beyond simple strings and templates are not implemented."
            }

            return shortcut.verb? { verbOverride: shortcut.verb, url: returnUrl } : returnUrl;

        },

        tryCreateApiObject: function (type, rawJSON, api) {
            return type in urlShortcuts ? new ApiObject(type, rawJSON, api) : rawJSON;
        },

        ApiObject: ApiObject

    };
    var urlShortcuts = {
        'products': {
            template: pub.urls.product + genericQueryTpt,
            defaults: {
                startIndex: 0,
                pageSize: 25
            }
        },

        'search': {
            template: pub.urls.search + genericQueryTpt,
            shortcutParam: 'q',
            defaults: {

            }
        },
        'product': {
            template: pub.urls.product + '{productCode}?{&allowInactive*}',
            shortcutParam: 'productCode',
            defaults: {
                allowInactive: false
            }
        },
        'cart': {
            get: pub.urls.cart + 'current',
            addproduct: {
                verb: 'POST',
                template: pub.urls.cart + 'current/items/'
            },
            empty: {
                verb: 'DELETE',
                template: pub.urls.cart + 'current/items/'
            }
        },
        'me': {
            get: {
                template: pub.urls.user + '{id}'
            },
            login: {
                template: pub.urls.user + "Login"
            }
        },
        'order': {
            create: {
                template: pub.urls.order + '{?cartId*}'
            }
        }

    };

    return pub;

}());
// END REFERENCE

/***********/