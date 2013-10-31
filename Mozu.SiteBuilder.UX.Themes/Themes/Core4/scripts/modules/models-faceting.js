define(['shim!vendor/underscore>_', "modules/backbone-mozu", "modules/models-product", "modules/mixin-paging"], function (_, Backbone, ProductModels, PagingMixin) {

    function sanitize(str) {
        return str ? str.replace(/[\s~'":]+/g, '-') : '';
    }

    var FacetValue = Backbone.MozuModel.extend({
        idAttribute: 'value'
    }),

    Facet = Backbone.MozuModel.extend({
        idAttribute: 'field',
        helpers: ['isFaceted'],
        defaults: {
            facetType: '',
            field: '',
            label: ''
        },
        relations: {
            values: Backbone.Collection.extend({
                model: FacetValue
            })
        },
        parse: function (raw) {
            // trying to accommodate the shape of the Hierarchical Facet
            if (raw.facetType === "Hierarchy") {
                raw.values = raw.values[0] ? raw.values[0].childrenFacetValues : [];
            }
            return raw;
        },
        isFaceted: function () {
            return !!this.get("values").findWhere({ "isApplied": true });
        },
        empty: function () {
            this.set("values", { isApplied: false });
            this.collection.parent.updateFacets();
        },
        getAppliedValues: function () {
            return _.invoke(this.get("values").where({ isApplied: true }), 'get', 'filterValue').join(',');
        }

    }),

    FacetedProductCollection = Backbone.MozuModel.extend(_.extend({
        mozuType: 'search',
        validation: {
            pageSize: { min: 1 },
            pageCount: { min: 1 },
            startIndex: { min: 0 }
        },
        dataTypes: {
            pageSize: Backbone.MozuModel.DataTypes.Int,
            pageCount: Backbone.MozuModel.DataTypes.Int,
            startIndex: Backbone.MozuModel.DataTypes.Int,
            totalCount: Backbone.MozuModel.DataTypes.Int,
        },
        relations: {
            facets: Backbone.Collection.extend({
                model: Facet
            }),
            items: Backbone.Collection.extend({
                model: ProductModels.Product
            })
        },
        clearAllFacets: function () {
            this.get("facets").invoke("empty");
        },
        getFacetValueFilter: function () {
            return _.compact(this.get("facets").invoke("getAppliedValues")).join(',');
        },
        setFacetValue: function(field, value, yes) {
            this.get("facets").findWhere({ field: field }).get("values").findWhere({ value: value }).set("isApplied", yes);
            this.updateFacets();
        },
        buildFacetRequest: function () {
            var conf = _.clone(this.get('baseRequestParams')),
                pageSize = this.get("pageSize"),
                startIndex = this.get("startIndex"),
                filterValue = this.getFacetValueFilter();
            conf.pageSize = pageSize;
            if (startIndex) conf.startIndex = startIndex;
            if (filterValue) conf.facetValueFilter = filterValue;
            return conf;
        },
        updateFacets: _.debounce(function () {
            var me = this,
                conf = this.buildFacetRequest();
            if (!_.isEqual(conf, this.lastRequest)) {
                this.lastRequest = conf;
                this.isLoading(true);
                // wipe current data set, since the server will give us our entire state
                this.unset('facets',{ silent: true });
                this.unset('items',{ silent: true });
                this.apiModel.get(conf).then(function() {
                    me.trigger("facetchange");
                }).ensure(function () {
                    me.isLoading(false);
                });
            }
        }, 300),
        initialize: function () {
            this.lastRequest = this.buildFacetRequest();
        }
    }, PagingMixin));

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection
    };

});


