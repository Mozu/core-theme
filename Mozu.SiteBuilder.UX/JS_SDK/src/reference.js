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
            var requestConf = ApiReference.getRequestConfig(actionName, this.type, data || this.data, this.api.context, this);
            me.fire('action', actionName, data, requestConf);
            return this.api.request(basicOps[actionName], requestConf, data).then(function (rawJSON) {
                if (requestConf.returnType) {
                    var returnObj = ApiReference.tryCreateApiObject(requestConf.returnType, rawJSON, me.api);
                    me.fire('spawn', returnObj);
                    return returnObj;
                } else {
                    utils.extend(me.data, rawJSON);
                    delete me.data.unsynced;
                    me.fire('sync', rawJSON, me.data);
                    return me;
                }
            }, function (errorJSON) {
                me.fire('error', errorJSON);
                throw errorJSON;
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

    utils.addEvents(ApiObject);

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

        getRequestConfig: function (operation, typeName, conf, context, obj) {
            var oType = objectTypes[typeName];
            if (!oType) return typeName;
            if (operation) operation = utils.dashCase(operation);
            if (oType[operation]) oType = oType[operation];
            if (!oType) throw "No known URL for '" + typeName + "' type.";
            if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);
            if (typeof oType === "string") oType = { template: oType };
            if (!oType.template) "No URL template found for '" + typeName + "'.";
            var returnObj = {};
            // cache templates lazily
            if (typeof oType.template === "string")
                oType.template = utils.uritemplate.parse(oType.template);
            var tptData = {};
            if (oType.includeSelf) tptData = utils.extend(tptData, obj.data);
            if (conf !== undefined && typeof conf !== "object") {
                if (!oType.shortcutParam) throw "No shortcut parameter available for '" + typeName + "'. Please supply a configuration object instead of '" + conf + "'.";
                tptData[oType.shortcutParam] = conf;
            } else if (conf) {
                utils.extend(tptData, conf.query || conf);
            }
            if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);
            returnObj.url = oType.template.expand(utils.extend({ _: tptData }, context.asObject('context-'), tptData, ApiReference.urls));
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
            template: '{+ProductService}' + genericQueryTpt,
            defaultParams: {
                startIndex: 0,
                pageSize: 25
            }
        },

        'search': {
            template: '{+SearchService}' + genericQueryTpt,
            shortcutParam: 'q',
            defaultParams: {

            }
        },
        'product': {
            get: {
                template: '{+ProductService}{ProductCode}?{&allowInactive*}',
                shortcutParam: 'ProductCode',
                defaultParams: {
                    allowInactive: false
                }
            },
            'add-to-cart': {
                verb: 'POST',
                returnType: 'cartitem',
                template: '{+CartService}current/items/'
            }
        },
        'cart': {
            get: '{+CartService}current',
            'add-product': {
                verb: 'POST',
                returnType: 'cartitem',
                template: '{+CartService}current/items/'
            },
            empty: {
                verb: 'DELETE',
                template: '{+CartService}current/items/'
            },
            checkout: {
                verb: 'POST',
                template: '{+OrderService}?cartId={Id}',
                returnType: 'order',
                noBody: true,
                includeSelf: true
            }
        },
        'cartitem': {
            defaults: {
                template: '{+CartService}current/items/{CartItemId}',
                shortcutParam: 'CartItemId'
            },
            'update-quantity': {
                verb: 'PUT',
                template: '{+CartService}current/items{/CartItemId,quantity}',
                shortcutParam: "quantity",
                includeSelf: true,
                noBody: true
            }
        },
        'user': {
            create: {
                verb: 'POST',
                template: '{+UserService}'
            },
            get: {
                template: '{+UserService}{Id}',
                shortcutParam: 'id'
            },            'get-by-email': {
                template: '{+UserService}{?emailAddress*}',
                shortcutParam: 'emailAddress'
            },
            login: {
                verb: 'POST',
                template: '{+UserService}Login',
                includeSelf: true,
                returnType: 'login'
            }
        },
        'login': {
            template: '{+UserService}Login'
        },
        'order': {
            get: {
                template: '{+OrderService}{Id}',
            },
            create: {
                template: '{+OrderService}{?cartId*}',
                shortcutParam: 'cartId',
                noBody: true
            },
            "update-shipping-address": {
                template: '{+OrderService}{Id}/shipment',
                verb: 'PUT',
                returnType: 'shipment',
                includeSelf: true
            },
            "set-user-id": {
                verb: 'PUT',
                template: '{+OrderService}{Id}/users',
                noBody: true,
                includeSelf: true,
                returnType: 'user'
            },
            'apply-coupon': {
                verb: 'PUT',
                template: '{+OrderService}{Id}/coupons/{couponCode}',
                shortcutParam: 'couponCode',
                includeSelf: true,
                noBody: true,
                returnType: 'coupon',
            },
            'remove-coupon': {
                verb: 'DELETE',
                template: '{+OrderService}{Id}/coupons',
                includeSelf: true
            },
            'get-available-actions': {
                template: '{+OrderService}{Id}/actions',
                includeSelf: true,
                returnType: 'orderactions'
            },
            'perform-order-action': {
                verb: 'PUT',
                template: '{+OrderService}{Id}/actions/{actionName}',
                shortcutParam: 'actionName',
                includeSelf: true,
                noBody: true
            },
            'add-order-note': {
                verb: 'POST',
                template: '{+OrderService}{Id}/notes',
                includeSelf: true,
                returnType: 'ordernote'
            },
        },
        'shipment': {
            defaults: {
                template: '{+OrderService}{orderId}/shipment',
                includeSelf: true,
            },
            "get-shipping-methods": {
                template: '{+OrderService}{orderId}/shipment/methods',
                returnType: 'shippingmethods'
            }
        },
        'payment': {
            template: '{+OrderService}{orderId}/payment',
            includeSelf: true
        },
        'ordernote': {
            template: '{+OrderService}{orderId}/notes/{Id}'
        },
        'document': {
            get: {
                template: '{+CmsService}{/documentListName,documentId}/{?version,status}',
                shortcutParam: 'documentId',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        },
        'documentbyname': {
            get: {
                template: '{+CmsService}{documentListName}/named/{documentName}/{?folderPath,version,status}',
                shortcutParam: 'documentName',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        },
        'addressschemas': '{+ReferenceService}addressschemas'
    };

    return pub;

}());
// END REFERENCE

/***********/