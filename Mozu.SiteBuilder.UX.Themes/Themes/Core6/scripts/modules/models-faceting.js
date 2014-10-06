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
        //parse: function (raw) {
        //    // trying to accommodate the shape of the Hierarchical Facet
        //    if (raw.facetType === "Hierarchy") {
        //        raw.values = raw.values[0] ? raw.values[0].childrenFacetValues : [];
        //    }
        //    return raw;
        //},
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
        getQueryString: function() {
            var qs = Backbone.MozuPagedCollection.prototype.getQueryString.apply(this, arguments) || "",
                extra = this.hierarchyValue && window.encodeURIComponent(this.hierarchyField) + "=" + window.encodeURIComponent(this.hierarchyValue);

            return qs? qs + "&" + extra : "?" + extra;
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
                    facetHierDepth: this.hierarchyField + ":" + this.hierarchyDepth
                };
            }
            this.lastRequest = this.buildRequest();
        },
        setHierarchy: function(hierarchyField, hierarchyValue) {
            this.hierarchyField = hierarchyField;
            this.hierarchyValue = hierarchyValue;
            this.baseRequestParams = (hierarchyValue !== null) && {
                filter: hierarchyField + ' req ' + hierarchyValue,
                facetTemplate: hierarchyField + ':' + hierarchyValue,
                facetHierValue: hierarchyField + ':' + hierarchyValue,
                facetHierDepth: hierarchyField + ':' + this.hierarchyDepth
            };
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
    });

    return {
        Facet: Facet,
        FacetValue: FacetValue,
        FacetedProductCollection: FacetedProductCollection
    };

});
