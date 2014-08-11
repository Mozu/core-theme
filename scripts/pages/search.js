define(['modules/jquery-mozu', "shim!vendor/underscore>_", 'hyprlive', 'modules/backbone-mozu', "modules/models-faceting", "modules/views-productlists", "modules/views-paging"], function ($, _, Hypr, Backbone, FacetingModels, ProductListViews, PagingViews) {

    var useAnimatedLists = Hypr.getThemeSetting('useAnimatedProductLists') && !Modernizr.mq('(max-width: 480px)');

    $(document).ready(function () {

        var $searchPageBody = $('[data-mz-search]'),
            $facetPanel = $('[data-mz-facets]'),
            categoryId = $searchPageBody.data('mz-category'),
            searchQuery = $searchPageBody.data('mz-search'),
            productListData = require.mozuData('facetedproducts'),
            facetingViews;

        if (productListData) {
            var facetingModel = new FacetingModels.FacetedProductCollection(productListData);            if (searchQuery) facetingModel.setQuery(searchQuery);            if (categoryId) facetingModel.setHierarchy('categoryId', categoryId);            facetingViews = {
                pagingControls: new PagingViews.PagingControls({
                    el: $searchPageBody.find('[data-mz-pagingcontrols]'),
                    model: facetingModel
                }),
                pageNumbers: new PagingViews.PageNumbers({
                    el: $searchPageBody.find('[data-mz-pagenumbers]'),
                    model: facetingModel
                }),
                productList: (useAnimatedLists ? new ProductListViews.AnimatedList({
                    el: $searchPageBody.find('[data-mz-productlist] .mz-productlist-list'),
                    model: facetingModel
                }) : new ProductListViews.List({
                    el: $searchPageBody.find('[data-mz-productlist]'),
                    model: facetingModel
                }))
            };            if ($facetPanel.length > 0) {
                facetingViews.facetPanel = new ProductListViews.FacetingPanel({
                    el: $facetPanel,                    model: facetingModel
                });
            }
            Backbone.history.start({ pushState: true, root: window.location.pathname });
            var router = new Backbone.Router();

            facetingModel.on('facetchange', function (newQuery) {
                router.navigate(newQuery, { replace: true });
            });

            facetingModel.on('change:pageSize', facetingModel.updateFacets, facetingModel);

        }

        _.invoke(facetingViews, 'render');

        //$searchPageBody.noFlickerFadeIn();

        window.facetingViews = facetingViews;

    });

});