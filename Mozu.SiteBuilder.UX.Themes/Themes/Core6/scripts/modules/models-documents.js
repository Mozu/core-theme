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

        DocumentCollection = Backbone.MozuPagedCollection.extend({
            relations: {
                items: Backbone.Collection.extend({
                    model: Document
                })
            },
            buildPagingRequest: function() {
                var conf = this.baseRequestParams ? _.clone(this.baseRequestParams) : {},
                pageSize = this.get("pageSize"),
                startIndex = this.get("startIndex"),
                filter = this.filter,
                query = this.query;
                conf.pageSize = pageSize;
                if (startIndex) conf.startIndex = startIndex;
                if (filter) conf.filter = filter;
                if (query) conf.query = this.query;
                return conf;
            },
            initialize: function() {
                this.lastRequest = this.buildPagingRequest();
            }
        });

        return {
            Document: Document,
            DocumentCollection: DocumentCollection
        };

});
