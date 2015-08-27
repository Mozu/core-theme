/**
 * Can be used on any Backbone.MozuModel that has had the paging mixin in mixins-paging added to it.
 */
define(['modules/jquery-mozu', 'underscore', 'hyprlive', 'modules/backbone-mozu', "modules/models-faceting", "modules/views-productlists", "modules/views-paging"], function($, _, Hypr, Backbone, FacetingModels, ProductListViews, PagingViews) {

    function factory(conf) {
        var views = {},
            model,
            categoryId = conf.$body.data('mz-category'),
            searchQuery = conf.$body.data('mz-search');

        if (searchQuery) {
            model = new FacetingModels.SearchResult(conf.data);
            model.setQuery(searchQuery);
        } else {
            model = new FacetingModels.Category(conf.data);
        }
        if (categoryId) model.setHierarchy('categoryId', categoryId);

        _.extend(views, {
            pagingControls: new PagingViews.PagingControls({
                el: conf.$body.find('[data-mz-pagingcontrols]'),
                model: model
            }),
            pageNumbers: new PagingViews.PageNumbers({
                el: conf.$body.find('[data-mz-pagenumbers]'),
                model: model
            }),
            pageSort: new PagingViews.PageSortView({
                el: conf.$body.find('[data-mz-pagesort]'),
                model: model
            }),
            productList: new ProductListViews.List({
                el: conf.$body.find('[data-mz-productlist]'),
                model: model
            })
        });

        if (conf.$facets.length > 0) {
            views.facetPanel = new ProductListViews.FacetingPanel({
                el: conf.$facets,
                model: model
            });
        }

        Backbone.history.start({ pushState: true, root: window.location.pathname });
        var router = new Backbone.Router();

        var navigating = false;

        model.on('facetchange', function(q) {
            if (!navigating) {
                router.navigate(q);
            }
            navigating = false;
        }, router);

        model.on('change:pageSize', model.updateFacets, model);

        _.invoke(views, 'delegateEvents');

        var defaultPageSize = Hypr.getThemeSetting('defaultPageSize');
        router.route('*all', "filter", function() {
            var urlParams = $.extend({ pageSize: defaultPageSize }, $.deparam()),
                options = {},
                req = model.lastRequest;
            if (!urlParams.startIndex) options.resetIndex = true;
            if (model.hierarchyField && (urlParams[model.hierarchyField] !== model.hierarchyValue)) {
                model.setHierarchy(model.hierarchyField, urlParams[model.hierarchyField] || categoryId);
                options.force = true;
            }
            model.set(_.pick(urlParams, 'pageSize', 'startIndex', 'facetValueFilter', 'sortBy'), { silent: true });
            navigating = true;
            model.updateFacets(options);
        });

        return views;

    }

    return {
        createFacetedCollectionViews: factory
    };

});