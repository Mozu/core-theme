define(['modules/jquery-mozu', 'underscore', 'hyprlive', 'modules/backbone-mozu', "modules/models-faceting", "modules/views-productlists", "modules/views-paging"], function($, _, Hypr, Backbone, FacetingModels, ProductListViews, PagingViews){

    var useAnimatedLists = Hypr.getThemeSetting('useAnimatedProductLists') && !Modernizr.mq('(max-width: 480px)');
    
    $(document).ready(function () {
        
        var $categoryPageBody = $('[data-mz-category]'),
            $facetPanel = $('[data-mz-facets]'),
            categoryId = $categoryPageBody.data('mz-category'),
            productListData = require.mozuData('facetedproducts'),
            facetingViews;

        if (productListData) {
            var facetingModel = new FacetingModels.FacetedProductCollection(productListData);            if (categoryId) facetingModel.setHierarchy('categoryId',categoryId);            facetingViews = {
                pagingControls: new PagingViews.PagingControls({
                    el: $categoryPageBody.find('[data-mz-pagingcontrols]'),
                    model: facetingModel
                }),
                pageNumbers: new PagingViews.PageNumbers({
                    el: $categoryPageBody.find('[data-mz-pagenumbers]'),
                    model: facetingModel
                }),
                pageSort: new PagingViews.PageSortView({
                    el: $categoryPageBody.find('[data-mz-pagesort]'),
                    model: facetingModel
                }),
                productList: new ProductListViews.List({
                    el: $categoryPageBody.find('[data-mz-productlist]'),
                    model: facetingModel
                })
            };            if ($facetPanel.length > 0) {                facetingViews.facetPanel = new ProductListViews.FacetingPanel({
                    el: $facetPanel,                    model: facetingModel
                });            }
            Backbone.history.start({ pushState: true, root: window.location.pathname });
            var router = new Backbone.Router();

            var navigating = false;

            facetingModel.on('facetchange', function(q) {
                if (!navigating) {
                    router.navigate(q);
                }
                navigating = false;
            }, router);

            facetingModel.on('change:pageSize', facetingModel.updateFacets, facetingModel);

            _.invoke(facetingViews, 'delegateEvents');

            var defaultPageSize = Hypr.getThemeSetting('defaultPageSize');
            router.route('*all', "filter", function() {
                var urlParams = $.extend({ pageSize: defaultPageSize }, $.deparam()),
                    options = {},
                    req = facetingModel.lastRequest;
                if (!urlParams.startIndex) options.resetIndex = true;
                facetingModel.set(_.pick(urlParams, 'pageSize', 'startIndex', 'facetValueFilter', 'sortBy'), { silent: true });
                navigating = true;
                facetingModel.updateFacets(options);
            });

        }

        window.facetingViews = facetingViews;

    });
    
});