// BEGIN REFERENCE
var ApiReference = (function () {

    var basicOps = {
        get: 'GET',
        update: 'PUT',
        create: 'POST',
        del: 'DELETE'
    };

    var genericQueryTpt = '{?_*}';
    var defaultHost = window.location.protocol + '//' + window.location.host + '/';

    var copyToConf = ['verb', 'returnType', 'noBody'],
        copyToConfLength = copyToConf.length;
    var pub = {

        basicOps: basicOps,
        urls: {},

        getActionsFor: function(typeName) {
            if (!objectTypes[typeName]) return false;
            var actions = [];
            for (var a in basicOps) {
                if (!(a in objectTypes[typeName]))
                    actions.push(a);

            }
            for (a in objectTypes[typeName]) {
                if (a && objectTypes[typeName].hasOwnProperty(a) && !reservedWords[a])
                    actions.push(utils.camelCase(a));
            }
            return actions;
        },

        getRequestConfig: function (operation, typeName, conf, context, obj) {

            var returnObj, tptData;

            // get object type from our reference
            var oType = objectTypes[typeName];
            
            // there may not be one
            if (!oType) throw Mozu.Utils.Exceptions.NoRequestConfigFound(typeName, operation);

            // get specific details of the requested operation
            if (operation) operation = utils.dashCase(operation);
            if (oType[operation]) oType = oType[operation];

            // some oTypes are a simple template as a string
            if (typeof oType === "string") oType = { template: oType };

            // the defaults at the root object type should be copied into all operation configs
            if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);

            // a template is required
            if (!oType.template) throw Mozu.Utils.Exceptions.NoRequestConfigFound(typeName, operation);

            returnObj = {};
            tptData = {};

            // cache templates lazily
            if (typeof oType.template === "string") oType.template = utils.uritemplate.parse(oType.template);

            // add the requesting object's data itself to the tpt context
            if (oType.includeSelf && obj) {
                if (oType.includeSelf.asProperty) {
                    tptData[oType.includeSelf.asProperty] = obj.data
                } else {
                    tptData = utils.extend(tptData, obj.data);
                }
            }

            // shortcutparam allows you to use the most commonly used conf property as a string or number argument
            if (conf !== undefined && typeof conf !== "object") {
                if (!oType.shortcutParam) throw Mozu.Utils.Exceptions.NoShortcutParamFound(typeName, conf);
                tptData[oType.shortcutParam] = conf;
            } else if (conf) {
                // add the conf argued directly into this request fn to the tpt context
                utils.extend(tptData, conf);
            }

            // default params added to template, but overridden by existing tpt data
            if (oType.defaultParams) tptData = utils.extend({}, oType.defaultParams, tptData);

            // remove stuff that the UriTemplate parser can't parse
            for (var tvar in tptData) {
                if (utils.getType(tptData[tvar]) == "Array") tptData[tvar] = JSON.stringify(tptData[tvar]);
            }
            returnObj.url = oType.template.expand(utils.extend({ _: tptData }, context.asObject('context-'), tptData, ApiReference.urls));
            for (var j = 0; j < copyToConfLength; j++) {
                if (copyToConf[j] in oType) returnObj[copyToConf[j]] = oType[copyToConf[j]];
            }
            if (oType.overridePostData) {
                var overriddenData;
                if (utils.getType(oType.overridePostData) == "Array") {
                    overriddenData = {};
                    for (var tOK = 0; tOK < oType.overridePostData.length; tOK++) {
                        overriddenData[oType.overridePostData[tOK]] = tptData[oType.overridePostData[tOK]];
                    }
                } else {
                    overriddenData = tptData;
                }
                returnObj.overridePostData = overriddenData;
            }
            return returnObj;
        },

        tryCreateApiObject: function (type, rawJSON, api) {
            return type in objectTypes ? (
                objectTypes[type].collectionOf ? 
                this.createApiCollection(type, rawJSON, api, objectTypes[type].collectionOf)
                : new ApiObject(type, rawJSON, api)
            ) : rawJSON;
        },

        createApiCollection: function (type, rawJSON, api, memberType) {
            return new ApiCollection(type, rawJSON, api, memberType)
        }
    };
    var reservedWords = {
        template: true,
        defaultParams: true,
        shortcutParam: true,
        defaults: true,
        verb: true,
        returnType: true,
        noBody: true,
        includeSelf: true,
        collectionOf: true
    };
    var objectTypes = {
        'products': {
            template: '{+productService}' + genericQueryTpt,
            shortcutParam: "filter",
            defaultParams: {
                startIndex: 0,
                pageSize: 15
            },
            collectionOf: 'product'
        },

        'categories': {
            template: '{+categoryService}' + genericQueryTpt,
            shortcutParam: "filter",
            defaultParams: {
                startIndex: 0,
                pageSize: 15
            },
            collectionOf: 'category'
        },

        'category': {
            template: '{+categoryService}{Id}(?allowInactive}',
            shortcutParam: 'Id',
            defaultParams: {
                allowInactive: false
            }
        },

        'search': {
            template: '{+searchService}searchz{?query,filter,facetTemplate,facetTemplateSubset,facet,facetFieldRangeQuery,facetHierPrefix,facetHierValue,facetHierDepth,facetStartIndex,facetPageSize,facetSettings,facetValueFilter,sortBy,pageSize,PageSize,startIndex,StartIndex}',
            shortcutParam: 'query',
            defaultParams: {
                startIndex: 0,
                query: "*:*",
                pageSize: 15
            },
            collectionOf: 'product'
        },
        'product': {
            get: {
                template: '{+productService}{ProductCode}?{&allowInactive*}',
                shortcutParam: 'ProductCode',
                defaultParams: {
                    allowInactive: false
                }
            },
            configure: {
                verb: 'POST',
                template: '{+productService}{ProductCode}/configure{?includeOptionDetails}',
                defaultParams: {
                    includeOptionDetails: true
                },
                includeSelf: true
            },
            'add-to-cart': {
                verb: 'POST',
                includeSelf: {
                    asProperty: 'Product'
                },
                overridePostData: true,
                shortcutParam: 'Quantity',
                returnType: 'cartitem',
                template: '{+cartService}current/items/'
            }
        },
        'cart': {
            get: '{+cartService}current',
            'add-product': {
                verb: 'POST',
                returnType: 'cartitem',
                template: '{+cartService}current/items/'
            },
            empty: {
                verb: 'DELETE',
                template: '{+cartService}current/items/'
            },
            checkout: {
                verb: 'POST',
                template: '{+orderService}?cartId={Id}',
                returnType: 'order',
                noBody: true,
                includeSelf: true
            }
        },
        'cartitem': {
            defaults: {
                template: '{+cartService}current/items/{Id}',
                shortcutParam: 'Id'
            },
            'update-quantity': {
                verb: 'PUT',
                template: '{+cartService}current/items{/Id,quantity}',
                shortcutParam: "quantity",
                includeSelf: true,
                noBody: true
            }
        },
        'user': {
            create: {
                verb: 'POST',
                template: '{+userService}'
            },
            get: {
                template: '{+userService}{Id}',
                shortcutParam: 'id'
            },
            'get-by-email': {
                template: '{+userService}{?emailAddress*}',
                shortcutParam: 'emailAddress'
            },
            login: {
                verb: 'POST',
                template: '{+userService}Login',
                includeSelf: true,
                returnType: 'login'
            },
            'change-password': {
                verb: 'POST',
                includeSelf: true,
                template: '{+userService}{Id}/changepassword'
            }
        },
        customer: {
            template: '{+customerService}{Id}',
            shortcutParam: 'Id',
            includeSelf: true
        },
        'login': '{+userService}Login',
        'address': {
            "validate-address": {
                verb: 'POST',
                template: '{+addressValidationService}',
                includeSelf: {
                    asProperty: 'Address'
                },
                overridePostData: true,
                returnType: 'address'
            }
        },
        'order': {
            template: '{+orderService}{Id}',
            includeSelf: true,
            create: {
                template: '{+orderService}{?cartId*}',
                shortcutParam: 'cartId',
                noBody: true
            },
            "update-shipping-info": {
                template: '{+orderService}{Id}/fulfillmentinfo',
                verb: 'PUT',
                returnType: 'shipment',
                includeSelf: true
            },
            "set-user-id": {
                verb: 'PUT',
                template: '{+orderService}{Id}/users',
                noBody: true,
                includeSelf: true,
                returnType: 'user'
            },
            'apply-coupon': {
                verb: 'PUT',
                template: '{+orderService}{Id}/coupons/{couponCode}',
                shortcutParam: 'couponCode',
                includeSelf: true,
                noBody: true,
                returnType: 'coupon'
            },
            'remove-coupon': {
                verb: 'DELETE',
                template: '{+orderService}{Id}/coupons/{couponCode}',
                shortcutParam: 'couponCode',
                includeSelf: true
            },
            'remove-all-coupons': {
                verb: 'DELETE',
                template: '{+orderService}{Id}/coupons',
                includeSelf: true
            },
            'get-available-actions': {
                template: '{+orderService}{Id}/actions',
                includeSelf: true,
                returnType: 'orderactions'
            },
            'perform-order-action': {
                verb: 'POST',
                template: '{+orderService}{Id}/actions',
                shortcutParam: 'ActionName',
                overridePostData: ['ActionName'],
                includeSelf: true
            },
            'add-order-note': {
                verb: 'POST',
                template: '{+orderService}{Id}/notes',
                includeSelf: true,
                returnType: 'ordernote'
            }
        },
        'shipment': {
            defaults: {
                template: '{+orderService}{orderId}/fulfillmentinfo',
                includeSelf: true
            },
            "get-shipping-methods": {
                template: '{+orderService}{orderId}/shipments/methods',
                returnType: 'shippingmethods'
            }
        },
        'payment': {
            template: '{+orderService}{orderId}/billinginfo',
            includeSelf: true
        },
        'ordernote': {
            template: '{+orderService}{orderId}/notes/{Id}'
        },
        'document': {
            get: {
                template: '{+cmsService}{/documentListName,documentId}/{?version,status}',
                shortcutParam: 'documentId',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        },
        'documentbyname': {
            get: {
                template: '{+cmsService}{documentListName}/named/{documentName}/{?folderPath,version,status}',
                shortcutParam: 'documentName',
                defaultParams: {
                    documentListName: 'default'
                }
            }
        },
        'addressschemas': '{+referenceService}addressschemas'
    };

    return pub;

}());
// END REFERENCE

/***********/