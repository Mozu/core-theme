// BEGIN REFERENCE
var ApiReference = (function () {

    var basicOps = {
        get: 'GET',
        update: 'PUT',
        create: 'POST',
        del: 'DELETE'
    };

    var ApiObject = function (type, data, iapi) {
        this.data = data;
        this.api = iapi;
        this.type = type;
    }

    ApiObject.prototype = {
        action: function (actionName, data) {
            var me = this;
            var requestConf = ApiReference.getRequestConfig(actionName, this.type, this.data, this.api.context);
            return this.api.request(null, requestConf, data).then(function (rawJSON) {
                if (requestConf.returnType) {
                    return ApiReference.tryCreateApiObject(requestConf.returnType, rawJSON, me.api);
                } else {
                    me.data = rawJSON;
                    return me;
                }
            });
        },
        getAvailableActions: function () {
            return ApiReference.getActionsFor(this.type);
        }
    };

    var setOp = function(fnName) {
        ApiObject.prototype[fnName] = function (conf) {
            return this.action(fnName, conf);
        }
    };
    for (var i in basicOps) {
        if (basicOps.hasOwnProperty(i)) setOp(i);
    }

    var genericQueryTpt = '{?_*}';
    var pub = {

        basicOps: basicOps,

        urls: {
        "product": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/products/",
        "cart": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Cart.WebApi/carts/",
        "user": "http://aus01pdweb001.ads.volusion.com:9090/mozu.User.WebApi/users/",
        "order": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Order.WebApi/orders/",
        "search": "http://aus01pdweb001.ads.volusion.com:9090/mozu.ProductRuntime.WebApi/productsearch/",
        "cms": "http://aus01pdweb001.ads.volusion.com:9090/mozu.Content.WebApi/documents/"
        },

        getActionsFor: function(typeName) {
            if (!objectTypes[typeName]) return false;
            var actions = [];
            for (var a in objectTypes[typeName]) {
                actions.push(a);
            }
            return actions;
        },

        getRequestConfig: function (operation, typeName, conf, context) {
            var oType = objectTypes[typeName];
            if (!oType) return typeName;
            if (oType[operation]) oType = oType[operation];
            if (!oType) throw "No known URL for '" + typeName + "' type.";
            if (typeof oType === "string") return oType;
            var returnObj = {};
            if (oType.url) {
                returnObj.url = oType.url;
            } else if (oType.template) {
                // cache templates lazily
                if (typeof oType.template === "string") oType.template = utils.uritemplate.parse(oType.template);
                var tptData = {};
                if (typeof conf === "string") {
                    if (!oType.shortcutParam) throw "No shortcut parameter available for '" + typeName + "'. Please supply a configuration object instead of '" + conf + "'.";
                    tptData[oType.shortcutParam] = conf;
                } else if (conf) {
                    utils.extend(tptData, conf.query || conf);
                }
                if (oType.defaults) tptData = utils.extend({}, oType.defaults, tptData);
                returnObj.url = oType.template.expand(utils.extend({ _: tptData }, context.asObject('context-'), tptData));
            } else {
                throw "URLs beyond simple strings and templates are not implemented."
            }
            if (oType.verb) returnObj.verbOverride = oType.verb;
            if (oType.returnType) returnObj.returnType = oType.returnType;
            return returnObj;
        },

        tryCreateApiObject: function (type, rawJSON, api) {
            return type in objectTypes ? new ApiObject(type, rawJSON, api) :
                (ApiReference.getTypeFromObject(rawJSON) ? new ApiObject(ApiReference.getTypeFromObject(rawJSON), rawJSON, api) : rawJSON);
        },

        getTypeFromObject: function (rawJSON) {
            //TODO: figure out how to do typing, omg
            return null;
        },

        ApiObject: ApiObject

        };
    var typeSignatures = {

    };
    var objectTypes = {
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
            get: {
                template: pub.urls.product + '{productCode}?{&allowInactive*}',
                shortcutParam: 'productCode',
                defaults: {
                    allowInactive: false
                }
            },
            addtocart: {
                verb: 'POST',
                returnType: 'cartitem',
                template: pub.urls.cart + 'current/items/'
            }
        },
        'cart': {
            get: pub.urls.cart + 'current',
            addproduct: {
                verb: 'POST',
                returnType: 'cartitem',
                template: pub.urls.cart + 'current/items/'
            },
            empty: {
                verb: 'DELETE',
                template: pub.urls.cart + 'current/items/'
            }
        },
        'cartitem': {
            template: pub.urls.cart + 'current/items/{id}',
            shortcutParam: 'id'
        },
        'me': {
            get: {
                template: pub.urls.user + '{id}',
                shortcutParam: 'id'
            },
            login: {
                template: pub.urls.user + "Login"
            }
        },
        'order': {
            create: {
                template: pub.urls.order + '{?cartId*}',
                shortcutParam: 'cartId'
            }
        },
        'document': {
            get: {
                template: pub.urls.cms + "{documentListName}/{documentId}/?version={version}&status={status}",
                shortcutParam: 'documentId',
                defaults: {
                    documentListName: 'default'
                }
            }
        },
        'documentbyname': {
            get: {
                template: pub.urls.cms + "{documentListName}/named/{documentName}/?folderPath={folderPath}&version={version}&status={status}",
                shortcutParam: 'documentName',
                defaults: {
                    documentListName: 'default'
                }
            }
        }
    };

    return pub;

}());
// END REFERENCE

/***********/