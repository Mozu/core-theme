// BEGIN REFERENCE
var ApiReference = (function () {

    errors.register({
        'NO_REQUEST_CONFIG_FOUND': 'No request configuration was found for {0}.{1}',
        'NO_SHORTCUT_PARAM_FOUND': 'No shortcut parameter available for {0}. Please supply a configuration object instead of "{1}".'
    });

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
            var actions = [], isSimpleType = (typeof objectTypes[typeName] === "string");
            for (var a in basicOps) {
                if (isSimpleType || !(a in objectTypes[typeName]))
                    actions.push(a);
            }
            if (!isSimpleType) {
                for (a in objectTypes[typeName]) {
                    if (a && objectTypes[typeName].hasOwnProperty(a) && !reservedWords[a])
                        actions.push(utils.camelCase(a));
                }
            }
            var declaredType = (objectTypes[typeName].collectionOf ? ApiCollection : ApiObject).types[typeName];
            if (declaredType) {
                for (a in declaredType) {
                    if (isSimpleType || !(utils.dashCase(a) in objectTypes[typeName] && !reservedWords[a]) && typeof declaredType[a] === "function") actions.push(a);
                }
            }

            return actions;
        },

        getRequestConfig: function (operation, typeName, conf, context, obj) {

            var returnObj, tptData;

            // get object type from our reference
            var oType = objectTypes[typeName];
            
            // there may not be one
            if (!oType) errors.throwOnObject(obj, 'NO_REQUEST_CONFIG_FOUND', typeName, '');

            // get specific details of the requested operation
            if (operation) operation = utils.dashCase(operation);
            if (oType[operation]) oType = oType[operation];

            // some oTypes are a simple template as a string
            if (typeof oType === "string") oType = { template: oType };

            // the defaults at the root object type should be copied into all operation configs
            if (objectTypes[typeName].defaults) oType = utils.extend({}, objectTypes[typeName].defaults, oType);

            // a template is required
            if (!oType.template) errors.throwOnObject(obj, 'NO_REQUEST_CONFIG_FOUND', typeName, operation);

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
                if (!oType.shortcutParam) errors.throwOnObject(obj, 'NO_SHORTCUT_PARAM_FOUND', typeName, conf);
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
            var fullTptContext = utils.extend({ _: tptData }, context.asObject('context-'), utils.flatten(tptData, {}), ApiReference.urls);
            returnObj.url = oType.template.expand(fullTptContext);
            for (var j = 0; j < copyToConfLength; j++) {
                if (copyToConf[j] in oType) returnObj[copyToConf[j]] = oType[copyToConf[j]];
            }
            if (oType.useIframeTransport) {
                // cache templates lazily
                if (typeof oType.useIframeTransport === "string") oType.useIframeTransport = utils.uritemplate.parse(oType.useIframeTransport);
                returnObj.iframeTransportUrl = oType.useIframeTransport.expand(fullTptContext);
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

        getType: function(typeName) {
            return objectTypes[typeName];
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
        collectionOf: true,
        overridePostData: true,
        useIframeTransport: true,
        construct: true,
        postconstruct: true,
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
            template: '{+categoryService}{id}(?allowInactive}',
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

        'customers': {
            collectionOf: 'customer'
        },

        'orders': {
            template: '{+orderService}' + genericQueryTpt,
            defaultParams: {
                startIndex: 0,
                pageSize: 15
            },
            collectionOf: 'order',
        },
        'product': {
            get: {
                template: '{+productService}{productCode}?{&allowInactive*}',
                shortcutParam: 'productCode',
                defaultParams: {
                    allowInactive: false
                }
            },
            configure: {
                verb: 'POST',
                template: '{+productService}{productCode}/configure{?includeOptionDetails}',
                defaultParams: {
                    includeOptionDetails: true
                },
                includeSelf: true
            },
            'add-to-cart': {
                verb: 'POST',
                includeSelf: {
                    asProperty: 'product'
                },
                overridePostData: true,
                shortcutParam: 'quantity',
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
                template: '{+orderService}?cartId={id}',
                returnType: 'order',
                noBody: true,
                includeSelf: true
            }
        },
        'cartitem': {
            defaults: {
                template: '{+cartService}current/items/{id}',
                shortcutParam: 'id'
            },
            'update-quantity': {
                verb: 'PUT',
                template: '{+cartService}current/items{/id,quantity}',
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
            update: {
                verb: 'PUT',
                template: '{+userService}{userId}',
                includeSelf: true
            },
            get: {
                template: '{+userService}{id}',
                shortcutParam: 'id'
            },
            'get-by-email': {
                template: '{+userService}{?emailAddress*}',
                shortcutParam: 'emailAddress'
            },
            login: {
                verb: 'POST',
                template: '{+userService}login',
                includeSelf: true,
                returnType: 'login'
            },
            'change-password': {
                verb: 'POST',
                includeSelf: true,
                template: '{+userService}{userId}/changepassword'
            },
            'get-customers': {
                template: '{+customerService}?fields=UserId+eq+{userId}',
                includeSelf: true,
                returnType: 'customers'
            }
            
        },
        customer: {
            template: '{+customerService}{id}',
            shortcutParam: 'id',
            includeSelf: true,
            create: {
                verb: 'POST',
                template: '{+customerService}'
            },
            'get-open-orders': {
                template: '{+orderService}?filter=Status eq "' + CONSTANTS.ORDER_STATUSES.SUBMITTED + '" or Status eq "' + CONSTANTS.ORDER_STATUSES.ACCEPTED + '" or Status eq "' + CONSTANTS.ORDER_STATUSES.PENDING_REVIEW + '" or Status eq "' + CONSTANTS.ORDER_STATUSES.PROCESSING + '" and CustomerAccountId eq "{id}" and OrderNumber ne null',
                includeSelf: true,
                returnType: 'orders'
            },
            'get-orders': {
                template: '{+orderService}?filter=CustomerAccountId eq "{id}" and OrderNumber ne null',
                includeSelf: true,
                returnType: 'orders'
            },
            'get-cards': {
                template: '{+customerService}{id}/cards',
                includeSelf: true,
                returnType: 'accountcards'
            },
            'add-card': {
                verb: 'POST',
                template: '{+customerService}{customer.id}/cards',
                includeSelf: {
                    asProperty: 'customer'
                },
                returnType: 'accountcard'
            },            'update-card': {
                verb: 'PUT',
                template: '{+customerService}{customer.id}/cards/{id}',
                includeSelf: {
                    asProperty: 'customer'
                },
                returnType: 'accountcard'
            },
            'delete-card': {
                verb: 'DELETE',
                template: '{+customerService}{customer.id}/cards/{id}',
                shortcutParam: 'id',
                includeSelf: {
                    asProperty: 'customer'
                },
                returnType: 'accountcard'
            },
            'add-contact': {
                verb: 'POST',
                template: '{+customerService}{id}/contacts',
                includeSelf: true,
                returnType: 'contact'
            },
            'get-contacts': {
                template: '{+customerService}{id}/contacts',
                includeSelf: true,
                returnType: 'contacts'
            },
            'delete-contact': {
                verb: 'DELETE',
                template: '{+customerService}{customer.id}/contacts/{id}',
                shortcutParam: 'id',
                includeSelf: {
                    asProperty: 'customer'
                },
                returnType: 'contact'
            }
        },
        contact: {
            template: '{+customerService}{accountId}/contacts/{id}',
            includeSelf: true
        },
        contacts: {
            collectionOf: 'contact'
        },
        'login': '{+userService}login',
        'address': {
            "validate-address": {
                verb: 'POST',
                template: '{+addressValidationService}',
                includeSelf: {
                    asProperty: 'address'
                },
                overridePostData: true,
                returnType: 'address'
            }
        },
        'order': {
            template: '{+orderService}{id}',
            includeSelf: true,
            create: {
                template: '{+orderService}{?cartId*}',
                shortcutParam: 'cartId',
                noBody: true
            },
            "update-shipping-info": {
                template: '{+orderService}{id}/fulfillmentinfo',
                verb: 'PUT',
                returnType: 'shipment',
                includeSelf: true
            },
            "set-user-id": {
                verb: 'PUT',
                template: '{+orderService}{id}/users',
                noBody: true,
                includeSelf: true,
                returnType: 'user'
            },
            'create-payment': {
                verb: 'POST',
                template: '{+orderService}{id}/payments/actions',
                includeSelf: true
            },
            'apply-coupon': {
                verb: 'PUT',
                template: '{+orderService}{id}/coupons/{couponCode}',
                shortcutParam: 'couponCode',
                includeSelf: true,
                noBody: true,
                returnType: 'coupon'
            },
            'remove-coupon': {
                verb: 'DELETE',
                template: '{+orderService}{id}/coupons/{couponCode}',
                shortcutParam: 'couponCode',
                includeSelf: true
            },
            'remove-all-coupons': {
                verb: 'DELETE',
                template: '{+orderService}{id}/coupons',
                includeSelf: true
            },
            'get-available-actions': {
                template: '{+orderService}{id}/actions',
                includeSelf: true,
                returnType: 'orderactions'
            },
            'perform-order-action': {
                verb: 'POST',
                template: '{+orderService}{id}/actions',
                shortcutParam: 'actionName',
                overridePostData: ['actionName'],
                includeSelf: true
            },
            'add-order-note': {
                verb: 'POST',
                template: '{+orderService}{id}/notes',
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
            create: {
                template: '{+orderService}{orderId}/payments/actions',
                includeSelf: true
            }
        },
        'accountcard': {
            template: '{+customerService}{id}/cards'
        },
        'accountcards': {
            collectionOf: 'accountcard'
        },
        'creditcard': {
            defaults: {
                useIframeTransport: '{+paymentService}../../Assets/mozu_receiver.html'
            },
            'save': {
                verb: 'POST',
                template: '{+paymentService}',
                returnType: 'string'
            },
            'update': {
                verb: 'PUT',
                template: '{+paymentService}{cardId}',
                returnType: 'string'
            },
            'del': {
                verb: 'DELETE',
                shortcutParam: 'cardId',
                template: '{+paymentService}{cardId}'
            }
        },
        'creditcards': {
            collectionOf: 'creditcard'
        },
        'ordernote': {
            template: '{+orderService}{orderId}/notes/{id}'
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
        'addressschemas': '{+referenceService}addressschemas',
        'wishlist': {
            'get': {
                template: '{+wishlistService}{id}',
                includeSelf: true
            },
            'get-default': {
                template: '{+wishlistService}?startIndex=0&pageSize=1&filter=Name%20eq%20' + CONSTANTS.DEFAULT_WISHLIST_NAME,
                returnType: 'wishlists'
            },
            'create-default': {
                verb: 'POST',
                template: '{+wishlistService}',
                defaultParams: {
                    name: CONSTANTS.DEFAULT_WISHLIST_NAME,
                    typeTag: 'default'      
                },
                overridePostData: true
            },
            'add-item': {
                verb: 'POST',
                template: '{+wishlistService}{id}/items/',
                includeSelf: true
            },
            'delete-all-items': {
                verb: 'DELETE',
                template: '{+wishlistService}{id}/items/'
            },
            'delete-item': {
                verb: 'DELETE',
                template: '{+wishlistService}{id}/items/{itemId}',
                includeSelf: true,
                shortcutParam: 'itemId'
            },
            'edit-item': {
                verb: 'PUT',
                template: '{+wishlistService}{id}/items/{itemId}',
                includeSelf: true
            },
            'add-item-to-cart': {
                verb: 'POST',
                returnType: 'cartitem',
                template: '{+cartService}current/items/'
            }
        },
        'wishlists': {
            collectionOf: 'wishlist'
        }
    };

    return pub;

}());
// END REFERENCE

/***********/