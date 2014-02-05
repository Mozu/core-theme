define(['modules/jquery-mozu', 'shim!vendor/underscore>_', "hyprlive", "modules/backbone-mozu", "modules/models-product", "modules/mixin-paging"], function ($, _, Hypr, Backbone, ProductModels, PagingMixin) {

    function sanitize(str) {
        return str ? str.replace(/[\s~'":]+/g, '-') : '';
    }

    var defaultPageSize = Hypr.getThemeSetting('defaultPageSize');

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
        //parse: function (raw) {
        //    // trying to accommodate the shape of the Hierarchical Facet
        //    if (raw.facetType === "Hierarchy") {
        //        raw.values = raw.values[0] ? raw.values[0].childrenFacetValues : [];
        //    }
        //    return raw;
        //},
        isFaceted: function () {
            return !!this.get("values").findWhere({ "isApplied": true });
        },
        empty: function () {
            this.set("values", { isApplied: false });
            this.collection.parent.updateFacets({ resetIndex: true });
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
        helpers: ['hasValueFacets'],
        hierarchyDepth: 2,
        hierarchyField: 'categoryId',
        setQuery: function (query) {
            this.query = query;
            if (!this.hierarchyValue && !this.baseRequestParams) {
                this.baseRequestParams = {
                    facet: this.hierarchyField,
                    facetHierDepth: this.hierarchyField + ":" + this.hierarchyDepth
                };
            }
            this.lastRequest = this.buildFacetRequest();
        },
        setHierarchy: function (hierarchyField, hierarchyValue) {
            this.hierarchyField = hierarchyField;
            this.hierarchyValue = hierarchyValue;
            this.baseRequestParams = (hierarchyValue !== null) && {
                filter: hierarchyField + ' req ' + hierarchyValue,
                facetTemplate: hierarchyField + ':' + hierarchyValue,
                facetHierValue: hierarchyField + ':' + hierarchyValue,
                facetHierDepth: hierarchyField + ':' + this.hierarchyDepth
            };
            if (this.query) this.baseRequestParams.query = this.query;
            this.lastRequest = this.buildFacetRequest();
        },
        hasValueFacets: function () {
            return !!this.get('facets').findWhere({ facetType: 'Value' });
        },
        clearAllFacets: function () {
            this.get("facets").invoke("empty");
        },
        getFacetValueFilter: function () {
            return _.compact(this.get("facets").invoke("getAppliedValues")).join(',');
        },
        setFacetValue: function (field, value, yes) {
            this.get("facets").findWhere({ field: field }).get("values").findWhere({ value: value }).set("isApplied", yes);
            this.updateFacets({ resetIndex: true });
        },
        buildFacetRequest: function () {
            var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                pageSize = this.get("pageSize"),
                startIndex = this.get("startIndex"),
                filterValue = this.getFacetValueFilter();
            conf.pageSize = pageSize;
            if (startIndex) conf.startIndex = startIndex;
            if (filterValue) conf.facetValueFilter = filterValue;
            if (this.query) conf.query = this.query;
            return conf;
        },
        updateFacets: _.debounce(function (options) {
            var me = this,
                conf;
            options = options || {};
            if (options.resetIndex) this.set("startIndex", 0);
            conf = this.buildFacetRequest();
            if (options.force || !_.isEqual(conf, this.lastRequest)) {
                this.lastRequest = conf;
                this.isLoading(true);
                // wipe current data set, since the server will give us our entire state
                this.get('facets').reset(null, { silent: true });
                this.get('items').reset(null, { silent: true });
                this.apiModel.get(conf).then(function () {
                    me.trigger("facetchange", me.getQueryString());
                }).ensure(function () {
                    me.isLoading(false);
                });
            }
        }, 300),
        getQueryString: function () {
            var self = this, lrClone = _.clone(this.lastRequest);
            _.each(lrClone, function (v, p) {
                if (self.baseRequestParams && (p in self.baseRequestParams)) delete lrClone[p];
            });
            if (parseInt(lrClone.pageSize, 10) === defaultPageSize) delete lrClone.pageSize;
            if (this.hierarchyField && this.hierarchyValue) lrClone[this.hierarchyField] = this.hierarchyValue;
            if (this.query) lrClone.query = this.query;
            return _.isEmpty(lrClone) ? "" : "?" + $.param(lrClone);
        },
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
