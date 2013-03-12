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
            return this.api.request(basicOps[actionName], requestConf, data).then(function (rawJSON) {
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
    var defaultHost = window.location.protocol + '//' + window.location.host + '/';
    var pub = {

        basicOps: basicOps,
        urls: {
            "ProductService": defaultHost + 'mozu.ProductRuntime.WebApi/products/',
            "CartService": defaultHost + 'mozu.Cart.WebApi/commerce/carts/',
            "UserService": defaultHost + 'mozu.User.WebApi/users/',
            "OrderService": defaultHost + 'mozu.Order.WebApi/orders/',
            "SearchService": defaultHost + 'mozu.ProductRuntime.WebApi/productsearch/',
            "CmsService": defaultHost + 'mozu.Content.WebApi/documents/',
        },

        getActionsFor: function(typeName) {
            if (!objectTypes[typeName]) return false;
            var actions = [];
            for (var a in basicOps) {
                if (!(a in objectTypes[typeName]))
                    actions.push(a);

            }
            for (a in objectTypes[typeName]) {
                if (a)
                    actions.push(utils.camelCase(a));
            }
            return actions;
        },

        parseServiceUrls: function(tpt) {
            // TODO: add unescape flag to uritemplates lib (fork uritemplates lib, obvs
            for (var svcName in this.urls) {
                tpt = tpt.replace(new RegExp('\\{\\$' + svcName + '\\}'), ApiReference.urls[svcName]);
            }
            return tpt;
        },

        getRequestConfig: function (operation, typeName, conf, context) {
            var oType = objectTypes[typeName];
            if (!oType) return typeName;
            if (operation) operation = utils.dashCase(operation);
            if (oType[operation]) oType = oType[operation];
            if (!oType) throw "No known URL for '" + typeName + "' type.";
            if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);
            if (typeof oType === "string") return { url: this.parseServiceUrls(oType) };
            var returnObj = {};
            if (oType.url) {
                returnObj.url = this.parseServiceUrls(oType.url);
            } else if (oType.template) {
                // cache templates lazily
                if (typeof oType.template === "string")
                    oType.template = utils.uritemplate.parse(this.parseServiceUrls(oType.template));
                var tptData = {};
                if (typeof conf === "string") {
                    if (!oType.shortcutParam) throw "No shortcut parameter available for '" + typeName + "'. Please supply a configuration object instead of '" + conf + "'.";
                    tptData[oType.shortcutParam] = conf;
                } else if (conf) {
                    utils.extend(tptData, conf.query || conf);
                }
                if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);
                returnObj.url = oType.template.expand(utils.extend({ _: tptData }, context.asObject('context-'), tptData, ApiReference.urls));
            } else {
                throw "URLs beyond simple strings and templates are not implemented."
            }
            if (oType.verb) returnObj.verbOverride = oType.verb;
            if (oType.returnType) returnObj.returnType = oType.returnType;
            if (oType.noBody) returnObj.noBody = oType.noBody;
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
            template: '{$ProductService}' + genericQueryTpt,
            defaultParams: {
                startIndex: 0,
                pageSize: 25
            }
        },

        'search': {
            template: '{$SearchService}' + genericQueryTpt,
            shortcutParam: 'q',
            defaultParams: {

            }
        },
        'product': {
            get: {
                template: '{$ProductService}{ProductCode}?{&allowInactive*}',
                shortcutParam: 'ProductCode',
                defaultParams: {
                    allowInactive: false
                }
            },
            'add-to-cart': {
                verb: 'POST',
                returnType: 'cartitem',
                template: '{$CartService}current/items/'
            }
        },
        'cart': {
            get: '{$CartService}current',
            'add-product': {
                verb: 'POST',
                returnType: 'cartitem',
                template: '{$CartService}current/items/'
            },
            empty: {
                verb: 'DELETE',
                template: '{$CartService}current/items/'
            },
            checkout: {
                verb: 'POST',
                template: '{$OrderService}?cartId={Id}',
                noBody: true
            }
        },
        'cartitem': {
            defaults: {
                template: '{$CartService}current/items/{CartItemId}',
                shortcutParam: 'CartItemId'
            },
            'update-quantity': {
                template: '{$CartService}current/items/{CartItemId}/{quantity}',
                shortcutParam: "quantity",
                noBody: true
            }
        },
        'me': {
            get: {
                template: '{$UserService}{Id}',
                shortcutParam: 'id'
            },
            login: {
                template: '{$UserService}Login'
            }
        },
        'order': {
            create: {
                template: '{$OrderService}{?cartId*}',
                shortcutParam: 'cartId',
                noBody: true
            }
        },
        'document': {
            get: {
                template: '{$CmsService}{documentListName}/{documentId}/?version={version}&status={status}',
                shortcutParam: 'documentId',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        },
        'documentbyname': {
            get: {
                template: '{$CmsService}{documentListName}/named/{documentName}/?folderPath={folderPath}&version={version}&status={status}',
                shortcutParam: 'documentName',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        }
    };

    return pub;

}());
// END REFERENCE

/***********/