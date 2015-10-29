define(['modules/jquery-mozu', 'underscore', 'modules/backbone-mozu', 'hyprlive'], function ($, _, Backbone, Hypr) {
    
    var ProductListView = Backbone.MozuView.extend({
            templateName: 'modules/product/product-list-tiled'
        }),

    FacetingPanel = Backbone.MozuView.extend({
        additionalEvents: {
            "change [data-mz-facet-value]": "setFacetValue",
            "click [data-mz-facet-link]": "handleFacetLink"
        },
        templateName: "modules/product/faceting-form",
        initialize: function () {
            this.listenTo(this.model, 'loadingchange', function (isLoading) {
                this.$el.find('input').prop('disabled', isLoading);
            });
        },
        clearFacets: function () {
            this.model.clearAllFacets();
        },
        clearFacet: function (e) {
            this.model.get("facets").findWhere({ field: $(e.currentTarget).data('mz-facet') }).empty();
        },
        drillDown: function(e) {
            var $target = $(e.currentTarget),
                id = $target.data('mz-hierarchy-id'),
                field = $target.data('mz-facet');
            this.model.setHierarchy(field, id);
            this.model.updateFacets({ force: true, resetIndex: true });
            e.preventDefault();
        },
        setFacetValue: function (e) {
            var $box = $(e.currentTarget);
            this.model.setFacetValue($box.data('mz-facet'), $box.data('mz-facet-value'), $box.is(':checked'));
        },
        handleFacetLink: function (e) {
            e.stopImmediatePropagation();
        }
    });



    return {
        List: ProductListView,
        FacetingPanel: FacetingPanel
    };
});