define(['underscore', 'hyprlivecontext'], function (_, HyprLiveContext) {

    var baseURL = "/api/commerce/catalog/storefront/productsearch/visualsearch";
    var baseConfig = {
        "apiUrl": "/api/commerce/catalog/storefront/productsearch/visualsearch",
        //   "errorLogUrl": baseURL + "/api/ApiLogs",
        "inputId": "mz-searchbox-input",
        "anchorElement": "mz-searchbox-field-dd",
        "trackingId": 999999999999,
        "numSuggestions": 8,
        "numRecs": 4,
        "suggestedContent": {
            "enable": true,
            "itemType": "type",
            "title": "title",
            "position": {
                "vertical": "bottom",
                "horizontal": "right"
            }
        },
        "attributeMappings": {
            "suggestion": {
                "name": "label",

                "detailUrl": "link",
                "itemId": "itemId",
                "type": "itemType",
                "Account_Item_ID": "itemId"
            },
            "recDetailLink": {
                "detailUrl": "link",
                "itemId": "Account_Item_ID"
            },
            "recImage": {
                "name": "short_description",
                "imageUrl": "image_link"
            },
            "recName": {
                "name": "productName"
            },
            "recPrice": {
                "currentPrice": "price"
            }
        },
        "arrangement": "vertical",
        "suggestionsPosition": "top",
        "itemsLayout": {
            "suggestions": "vertical",
            "recommendations": {
                "recLayout": "vertical",
                "contentView": "landscape"
            }
        },
        "recommendations.source": {
            "enable": true,
            "suggestions.field.name": "itemType",
            "suggestions.field.values": {
                "PRODUCT": {
                    "request.verb": "GET",
                    "request.url": "https://search.certona.com/api/visualsearch",
                    "request.api.rules": "certona",
                    "request.params": {
                        "searchTerm": {
                            "value": "suggestion.field.value",
                            "suggestion.field.name": "item_name"
                        },
                        "filters": [
                            {
                                "name": "ItemType",
                                "values": [
                                    "PRODUCT"
                                ]
                            }
                        ],
                        "returnFields": [
                            "item_name",
                            "url",
                            "ImageURL"
                        ],
                        "ignoregrouping": true
                    }
                },
                "CATEGORY": {
                    "request.verb": "GET",
                    "request.url": "https://search.certona.com/api/visualsearch",
                    "request.api.rules": "certona",
                    "request.params": {
                        "searchTerm": {
                            "value": "user.input"
                        },
                        "filters": [
                            {
                                "name": "ItemType",
                                "values": [
                                    "PRODUCT"
                                ]
                            },
                            {
                                "name": "categoryid",
                                "values": [
                                    "filter.field.value"
                                ],
                                "filter.field.name": "Account_Item_ID"
                            }
                        ],
                        "returnFields": [
                            "item_name",
                            "categoryid",
                            "url",
                            "ImageURL"
                        ],
                        "ignoregrouping": true
                    }
                }
            }
        },
        "recommendations.source2": {
            "enable": true,
            "suggestions.field.name": "type",
            "suggestions.field.values": {
                "Product": {
                    "request.verb": "GET",
                    "request.url": "/api/commerce/catalog/storefront/productsearch/visualsearch",
                    "request.api.rules": "certona",
                    "request.params": {
                        "searchTerm": {
                            "value": "suggestion.field.label",
                            "suggestion.field.name": "label"
                        },
                        "filters": [
                            {
                                "name": "type",
                                "values": [
                                    "Product",
                                    "product",
                                    "PRODUCT"
                                ]
                            }
                        ],
                        "returnFields": [
                            "Account_Item_ID",
                            "title",
                            "image_link",
                            "short_description",
                            "price",
                            "link"
                        ],
                        "ignoregrouping": false
                    }
                },
                "Category": {
                    "request.verb": "GET",
                    "request.url": "/api/commerce/catalog/storefront/productsearch/visualsearch",
                    "request.api.rules": "certona",
                    "request.params": {
                        "searchTerm": {
                            "value": "user.input"
                        },
                        "filters": [
                            {
                                "name": "type",
                                "values": [
                                    "Product"
                                ]
                            },
                            {
                                "name": "categoryid",
                                "values": [
                                    "filter.field.value"
                                ],
                                "filter.field.name": "Account_Item_ID"
                            }
                        ],
                        "returnFields": [
                            "item_name",
                            "categoryid",
                            "ImageURL"
                        ],
                        "ignoregrouping": true
                    }
                }
            }
        },
        templates2: {
            suggestion: '<a class="tt-suggestion-wrapper tt-suggestion-wrapper-custom" href="[[link]]" data-itemid="[[itemId]]" onmouseover="CertonaVisualSearch.suggestionHover(this)"><div class="tt-suggestion-text tt-suggestion-text-custom">[[name]]</div></a>',
            recImage: '<div class="tt-recommendation-image-wrapper tt-recommendation-image-wrapper-custom"><img class="tt-recommendation-image tt-recommendation-image-custom" src="[[imageUrl]]?max=120" alt="[[name]]"></div>',
            recDetailLink: '<a class="tt-recommendation-detail-link tt-recommendation-detail-link-custom" href="/p/[[itemId]]/[[detailUrl]]"></a>'
        }
    };


    // var config = _.extend(baseConfig, {
    //     appid: HyprLiveContext.locals.themeSettings.visualSearchAppid,
    //     apiKey: HyprLiveContext.locals.themeSettings.visualSearchApiKey,
    //     catalogId: HyprLiveContext.locals.themeSettings.visualSearchCatalogId,
    //     scheme: HyprLiveContext.locals.themeSettings.visualSearchScheme
    // });

    return baseConfig;
});


