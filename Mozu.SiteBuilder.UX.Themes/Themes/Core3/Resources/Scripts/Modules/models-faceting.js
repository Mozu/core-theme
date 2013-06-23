define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel", "modules/models-product", "modules/function-throttler"], function ($, ko, KnockoutVM, ProductModels, throttle) {

    function sanitize(str) {
        return str ? str.replace(/[\s~'":]+/g, '-') : '';
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
            populate: function (d) {
                // trying to accommodate the shape of the Hierarchical Facet
                if (d.FacetType === "Hierarchy") {
                    d.Values = d.Values[0] ? d.Values[0].ChildrenFacetValues : [];
                }
                FacetValue.prototype.populate.call(this, d);
            }
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
            this.on('facetchange', function () {
                if (!parent.eventsSuspended) parent.publish.apply(parent, ['facetchange'].concat(Array.prototype.slice.call(arguments)));
            });
        }),

        FacetedProductCollection = KnockoutVM.extend({
            mozuType: 'search',
            observables: {
                PageSize: { numeric: 0},
                TotalCount: { numeric: 0},
                PageCount: { numeric: 0 },
                StartIndex: { numeric: 0 }
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
            buildFacetRequest: function() {
                var me = this;
                var conf = $.extend({}, this.baseRequestParams),
                    pageSize = this.PageSize(),
                    startIndex = this.StartIndex(),
                    filterValue = this.getFacetValueFilter();
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (filterValue) conf.facetValueFilter = filterValue;
                return conf;
            },
            updateFacets: function () {
                var me = this;
                var conf = this.buildFacetRequest();
                if (JSON.stringify(conf) !== JSON.stringify(this.lastRequest)) {
                    this.lastRequest = conf;
                    this.submitting(true);
                    this.get(conf).then(function () {
                        me.submitting(false);
                    });
                }
            },
            previousPage: function () {
                try {
                    this.apiModel.prevPage(this.lastRequest);
                } catch (e) { }
            },
            nextPage: function () {
                try {
                    this.apiModel.nextPage(this.lastRequest);
                } catch (e) { }
            }
        }, function () {
            var me = this,
                startIndex = me.StartIndex();

            // defining this here so it keeps scope when called from a click handler
            this.setPage = function (num) {
                if (num <= me.PageCount()) me.get($.extend({}, me.lastRequest, {
                    startIndex: (num - 1) * me.PageSize()
                }));
            };

            if (isNaN(parseInt(startIndex))) me.StartIndex(0);

            this.lastIndex = ko.computed(function () {
                return me.StartIndex() + me.Items().length;
            });

            this.hasPreviousPage = ko.computed(function () {
                return me.StartIndex() > 0;
            });

            this.hasNextPage = ko.computed(function () {
                return me.lastIndex() < me.TotalCount();
            });

            this.pageNumbers = ko.computed(function () {
                var nums = me.PageCount(), ret = [];
                for (var i = 1; i <= nums; i++) {
                    ret.push(i);
                }
                return ret;
            });

            this.on('facetchange', function () {
                me.updateFacets();
            });

            this.lastRequest = this.buildFacetRequest();
        });

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection
    };

});


