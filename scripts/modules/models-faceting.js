define(['modules/jquery-mozu', 'underscore', "hyprlive", "modules/backbone-mozu", "modules/models-product"], function($, _, Hypr, Backbone, ProductModels) {

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
        isFaceted: function() {
            return !!this.get("values").findWhere({ "isApplied": true });
        },
        empty: function() {
            this.set("values", { isApplied: false });
            this.collection.parent.updateFacets({ resetIndex: true });
        },
        getAppliedValues: function() {
            return _.invoke(this.get("values").where({ isApplied: true }), 'get', 'filterValue').join(',');
        }

    }),

    FacetedProductCollection = Backbone.MozuPagedCollection.extend({
        mozuType: 'search',
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
        getQueryParams: function() {
            var params = Backbone.MozuPagedCollection.prototype.getQueryParams.apply(this, arguments);
            if (this.hierarchyValue) {
                params[window.encodeURIComponent(this.hierarchyField)] = window.encodeURIComponent(this.hierarchyValue);
            }
            return params;
        },
        buildRequest: function(filterValue) {
            var conf = Backbone.MozuPagedCollection.prototype.buildRequest.apply(this, arguments);
            filterValue = filterValue || this.getFacetValueFilter();
            if (filterValue) conf.facetValueFilter = filterValue;
            return conf;
        },
        setQuery: function(query) {
            this.query = query;
            if (!this.hierarchyValue && !this.baseRequestParams) {
                this.baseRequestParams = {
                    facet: this.hierarchyField,
                    facetHierDepth: this.hierarchyField + ":" + this.hierarchyDepth,
                    query: query
                };
            }
            this.lastRequest = this.buildRequest();
        },
        setHierarchy: function(hierarchyField, hierarchyValue) {
            this.hierarchyField = hierarchyField;
            this.hierarchyValue = hierarchyValue;
            this.baseRequestParams = this.baseRequestParams || {};
            if (hierarchyValue || hierarchyValue === 0) {
                this.baseRequestParams = _.extend(this.baseRequestParams, {
                    filter: hierarchyField + ' req ' + hierarchyValue,
                    facetTemplate: hierarchyField + ':' + hierarchyValue,
                    facetHierValue: hierarchyField + ':' + hierarchyValue,
                    facetHierDepth: hierarchyField + ':' + this.hierarchyDepth
                });
            } else {
                this.baseRequestParams = _.omit(this.baseRequestParams, 'filter', 'facetTemplate', 'facetHierValue', 'facetHierDepth');
            }
            if (this.query) this.baseRequestParams.query = this.query;
            this.lastRequest = this.buildRequest();
        },
        hasValueFacets: function() {
            return !!this.get('facets').findWhere({ facetType: 'Value' });
        },
        clearAllFacets: function() {
            this.get("facets").invoke("empty");
        },
        getFacetValueFilter: function() {
            return _.compact(this.get("facets").invoke("getAppliedValues")).join(',');
        },
        setFacetValue: function(field, value, yes) {
            var thisFacetValues = this.get('facets').findWhere({ field: field }).get('values'),
                // jQuery.data attempts to detect type, but the facet value might be a string anyway
                newValue = thisFacetValues.findWhere({ value: value }) || thisFacetValues.findWhere({
                    value: value.toString()
                });
            newValue.set("isApplied", yes);
            this.updateFacets({ resetIndex: true });
        },
        updateFacets: function(options) {
            var me = this,
                conf;
            options = options || {};
            if (options.resetIndex) this.set("startIndex", 0);
            conf = this.buildRequest(options.facetValueFilter);
            if (options.force || !_.isEqual(conf, this.lastRequest)) {
                this.lastRequest = conf;
                this.isLoading(true);
                // wipe current data set, since the server will give us our entire state
                this.get('facets').reset(null, { silent: true });
                this.get('items').reset(null, { silent: true });
                this.apiModel.get(conf).ensure(function() {
                    me.isLoading(false);
                });
            }
        },
        initialize: function() {
            var me = this;
            Backbone.MozuPagedCollection.prototype.initialize.apply(this, arguments);
            this.updateFacets = _.debounce(this.updateFacets, 300);
            this.on('sync', function() {
                me.trigger('facetchange', me.getQueryString());
            });
        }
    }),

    Category = FacetedProductCollection.extend({}),

    SearchResult = FacetedProductCollection.extend({
        defaultSort: '', // relevance rather than createdate
        buildRequest: function() {
            var conf = FacetedProductCollection.prototype.buildRequest.apply(this, arguments);
            if (this.query) conf.query = this.query;
            return conf;
        },
        getQueryParams: function() {
            var params = FacetedProductCollection.prototype.getQueryParams.apply(this, arguments);
            if (this.query) params.query = this.query;
            return params;
        }
    });

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection,
        Category: Category,
        SearchResult: SearchResult
    };

});
