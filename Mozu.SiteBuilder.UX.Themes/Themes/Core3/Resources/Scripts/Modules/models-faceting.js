define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-product", "modules/function-throttler"], function ($, ko, KnockoutVM, ProductModels, throttle) {

    function sanitize(str) {
        return str.replace(/[\s~'":]+/g, '-');
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
            var me = this,
                parent = this.getParentModel();
            this.id = sanitize(this.FilterValue);
            this.IsApplied.subscribe(function (val) {
                if (!parent.eventsSuspended) parent.publish('facetchange', val, me.FilterValue, me);
            });
        }),

        Facet = KnockoutVM.extend({
            statics: {
                FacetType: '',
                Field: '',
                Label: ''
            },
            submodelArrays: {
                Values: FacetValue
            },
        }, function () {
            var me = this,
                parent = this.getParentModel();
            this.empty = ko.computed({
                write: function (yes) {
                    if (yes) {
                        me.eventsSuspended = true;
                        ko.utils.arrayForEach(me.Values(), function (val) {
                            val.IsApplied(false);
                        });
                        me.eventsSuspended = false;
                        if (!parent.eventsSuspended) parent.publish('facetchange', '', '', me);
                    }
                },
                read: function () {
                    return !ko.utils.arrayFirst(me.Values(), function (val) {
                        return val.IsApplied();
                    });
                }
            });
            this.emptyId = sanitize(this.Field);
            this.on('facetchange', function () {
                if (!parent.eventsSuspended) parent.publish.apply(parent, ['facetchange'].concat(Array.prototype.slice.call(arguments)));
            });
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
                this.eventsSuspended = true;
                ko.utils.arrayForEach(this.Facets(), function (facet) {
                    facet.eventsSuspended = true;
                    facet.empty(true);
                });
                this.eventsSuspended = false;
                this.updateFacets();
                return false;
            },
            getFacetValueFilter: function () {
                return $.map(this.Facets(), function (facet) {
                    return $.map(facet.Values(), function (value) {
                        return value.IsApplied() ? value.FilterValue : null;
                    })
                }).join(',');
            },
            updateFacets: function () {
                this.submitting(true);
                var conf = {
                    filter: 'categoryId req ' + this.categoryId,
                    facetTemplate: 'category:' + this.categoryId
                },
                filterValue = this.getFacetValueFilter();
                if (filterValue) conf.facetValueFilter = filterValue;
                this.get(conf);
            }
        }, function () {
            var me = this;
            this.on('facetchange', function () {
                me.updateFacets();
            });
        });

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection
    };

});


