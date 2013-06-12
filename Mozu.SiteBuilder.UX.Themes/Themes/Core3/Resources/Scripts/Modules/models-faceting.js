define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-product", "modules/function-throttler"], function ($, ko, KnockoutVM, ProductModels, throttle) {

    function sanitize(str) {
        return str.replace(/[\s~'"]+/g, '-');
    }

    var FacetValue = KnockoutVM.extend({
            statics: {
                Count: '',
                FilterValue: '',
                Label: '',
                Value: ''
            },
            observables: {
                IsApplied: {}
            }
    },
        function () {
            this.id = sanitize(this.FilterValue);
        }),

        Facet = KnockoutVM.extend({
            statics: {
                FacetType: '',
                Field: '',
                Label: ''
            },
            submodelArrays: {
                Values: FacetValue
            }
        }, function () {
            this.empty = ko.computed({
                write: function (yes) {
                    if (yes) {
                        console.log('emptying facet');
                    }
                },
                read: function () {
                    console.log('reading empty state');
                }
            });
            this.emptyId = sanitize(this.Field);
        }),

        FacetedProductCollection = KnockoutVM.extend({
            mozuType: 'search',
            observables: {
                PageSize: '',
            },
            submodelArrays: {
                Facets: Facet,
                Items: ProductModels.Product
            },
            clearAllFacets: function () {

            }
        });

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection
    };

});


