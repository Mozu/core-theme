define(
    ["modules/backbone-mozu", "underscore", "hyprlivecontext"],
    function (Backbone, _, PagingMixin, context) {
        
        var locals = context.locals;

        var Document = Backbone.MozuModel.extend({
            helpers: ['url'],
            url: function() {
                // attributes available through this.get, theme settings and sitecontext available through "locals.themeSettings" and "locals.siteContext"
                return "/cms/" + this.get('id');
            }
        }),

        DocumentCollection = Backbone.MozuModel.extend(_.extend({
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
                items: Backbone.Collection.extend({
                    model: Document
                })
            },
            getFilter: function() {
                // unimplemented in default collection
            },
            getQuery: function() {
                // unimplemented in default collection
            },
            buildPagingRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                pageSize = this.get("pageSize"),
                startIndex = this.get("startIndex"),
                filter = this.getFilter(),
                query = this.getQuery();
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (filter) conf.filter = filter;
                if (query) conf.query = this.query;
                return conf;
            },
            initialize: function() {
                this.lastRequest = this.buildPagingRequest();
            }
        }, PagingMixin));

        return {
            Document: Document,
            DocumentCollection: DocumentCollection
        };

});
