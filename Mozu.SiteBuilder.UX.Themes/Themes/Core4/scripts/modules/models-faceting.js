define(['shim!vendor/underscore>_', "modules/backbone-mozu", "modules/models-product", "modules/mixin-paging"], function (_, Backbone, ProductModels, PagingMixin) {

    function sanitize(str) {
        return str ? str.replace(/[\s~'":]+/g, '-') : '';
    }

    var FacetValue = Backbone.MozuModel.extend({
        idAttribute: 'Value'
    }),

    Facet = Backbone.MozuModel.extend({
        idAttribute: 'Field',
        helpers: ['isFaceted'],
        defaults: {
            FacetType: '',
            Field: '',
            Label: ''
        },
        relations: {
            Values: Backbone.Collection.extend({
                model: FacetValue
            })
        },
        parse: function (raw) {
            // trying to accommodate the shape of the Hierarchical Facet
            if (raw.FacetType === "Hierarchy") {
                raw.Values = raw.Values[0] ? raw.Values[0].ChildrenFacetValues : [];
            }
            return raw;
        },
        isFaceted: function () {
            return !!this.get("Values").findWhere({ "IsApplied": true });
        },
        empty: function () {
            this.set("Values", { IsApplied: false });
            this.collection.parent.updateFacets();
        },
        getAppliedValues: function () {
            return _.invoke(this.get("Values").where({ IsApplied: true }), 'get', 'FilterValue').join(',');
        }

    }),

    FacetedProductCollection = Backbone.MozuModel.extend(_.extend({
        mozuType: 'search',
        validation: {
            PageSize: { min: 1 },
            PageCount: { min: 1 },
            StartIndex: { min: 0 }
        },
        dataTypes: {
            PageSize: Backbone.MozuModel.DataTypes.Int,
            PageCount: Backbone.MozuModel.DataTypes.Int,
            StartIndex: Backbone.MozuModel.DataTypes.Int,
            TotalCount: Backbone.MozuModel.DataTypes.Int,
        },
        relations: {
            Facets: Backbone.Collection.extend({
                model: Facet
            }),
            Items: Backbone.Collection.extend({
                model: ProductModels.Product
            })
        },
        clearAllFacets: function () {
            this.get("Facets").invoke("empty");
        },
        getFacetValueFilter: function () {
            return _.compact(this.get("Facets").invoke("getAppliedValues")).join(',');
        },
        setFacetValue: function(field, value, yes) {
            this.get("Facets").findWhere({ Field: field }).get("Values").findWhere({ Value: value }).set("IsApplied", yes);
            this.updateFacets();
        },
        buildFacetRequest: function () {
            var conf = _.clone(this.get('baseRequestParams')),
                pageSize = this.get("PageSize"),
                startIndex = this.get("StartIndex"),
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
                this.unset('Facets',{ silent: true });
                this.unset('Items',{ silent: true });
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


