define(['underscore', 'hyprlivecontext'], function (_, HyprLiveContext) {

var baseURL = HyprLiveContext.locals.themeSettings.visualSearchBaseURL;
var baseConfig = {
        "apiUrl": baseURL + "/api/visualsearch/",
        "errorLogUrl": baseURL + "/api/ApiLogs",
        "inputId": "mz-searchbox-input",
        "anchorElement":"mz-searchbox-field-dd",
        "trackingId": 999999999999,
        "numSuggestions":8,
        "numRecs":4,
        "suggestedContent": {
            "enable": true,
            "itemType": "type",
            "title": "title",
            "position": {
                "vertical": "bottom",
                "horizontal": "right"
            }
        },
        "attributeMappings":{
            "suggestion":{
                "name":"title",
                "detailUrl":"link",
                "itemId":"Account_Item_ID",
                "type": "type",
                "Account_Item_ID": "Account_Item_ID"
            },
            "recDetailLink":{
                "detailUrl":"link"
            },
            "recImage":{
                "name":"short_description",
                "imageUrl":"image_link"
            },
            "recName":{
                "name":"title"
            },
            "recPrice": {
                "currentPrice": "price"
            }
        },
        "arrangement":"vertical",
        "suggestionsPosition": "top",
        "itemsLayout":{
            "suggestions":"vertical",
            "recommendations":{
            "recLayout":"vertical",
            "contentView":"landscape"
            }
        },
        "recommendations.source":{
            "enable":true,
            "suggestions.field.name":"type",
            "suggestions.field.values":{
                "Product":{
                    "request.verb":"GET",
                    "request.url": baseURL + "/api/visualsearch",
                    "request.api.rules":"certona",
                    "request.params":{
                        "searchTerm":{
                            "value":"suggestion.field.value",
                            "suggestion.field.name":"title"
                        },
                        "filters":[
                            {
                                "name":"type",
                                "values":[
                                    "Product",
                                    "product",
                                    "PRODUCT"
                                ]
                            }
                        ],
                        "returnFields":[
                            "title",
                            "image_link",
                            "short_description",
                            "price",
                            "link"
                        ],
                        "ignoregrouping":true
                    }
                },
                "Category":{
                    "request.verb":"GET",
                    "request.url": baseURL + "api/visualsearch",
                    "request.api.rules":"certona",
                    "request.params":{
                        "searchTerm":{
                            "value":"user.input"
                        },
                        "filters":[
                            {
                                "name":"type",
                                "values":[
                                    "Product"
                                ]
                            },
                            {
                                "name":"categoryid",
                                "values":[
                                    "filter.field.value"
                                ],
                                "filter.field.name": "Account_Item_ID"
                            }
                        ],
                        "returnFields":[
                            "item_name",
                            "categoryid",
                            "ImageURL"
                        ],
                        "ignoregrouping":true
                    }
                }
            }
        },
        templates: {
            suggestion: '<a class="tt-suggestion-wrapper tt-suggestion-wrapper-custom" href="/p/[[itemId]]/[[detailUrl]]" data-itemid="[[itemId]]" onmouseover="CertonaVisualSearch.suggestionHover(this)"><div class="tt-suggestion-text tt-suggestion-text-custom">[[name]]</div></a>'
        }
    };

    var config = _.extend(baseConfig,  {
        appid: HyprLiveContext.locals.themeSettings.visualSearchAppid,
        apiKey: HyprLiveContext.locals.themeSettings.visualSearchApiKey,
        catalogId: HyprLiveContext.locals.themeSettings.visualSearchCatalogId,
        scheme: HyprLiveContext.locals.themeSettings.visualSearchScheme
    });

    return config;
});