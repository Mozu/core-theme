define(['modules/jquery-mozu', 'hyprlive', 'modules/backbone-mozu', "modules/models-faceting", "modules/views-productlists", "modules/views-paging"], function($, Hypr, Backbone, FacetingModels, ProductListViews, PagingViews){

    var useAnimatedLists = Hypr.getThemeSetting('useAnimatedProductLists') && !Modernizr.mq('(max-width: 480px)');
    
    $(document).ready(function () {
        
        var $categoryPageBody = $('[data-mz-category]'),
            $facetPanel = $('[data-mz-facets]'),
            categoryId = $categoryPageBody.data('mz-category'),
            productListData = require.mozuData('facetedproducts'),
            defaultPageSize = Hypr.getThemeSetting('defaultPageSize');

        if (productListData) {
            productListData.baseRequestParams = {
                filter: 'categoryId req ' + categoryId,
                facetTemplate: 'categoryId:' + categoryId,
                facetHierValue: 'categoryId:' + categoryId,
                facetHierDepth: 'categoryId:2'
            };

            var facetingModel = new FacetingModels.FacetedProductCollection(productListData);            var facetingViews = {
                pagingControls: new PagingViews.PagingControls({
                    el: $categoryPageBody.find('[data-mz-pagingcontrols]'),
                    model: facetingModel
                }),
                pageNumbers: new PagingViews.PageNumbers({
                    el: $categoryPageBody.find('[data-mz-pagenumbers]'),
                    model: facetingModel
                }),
                productList: ( useAnimatedLists ? new ProductListViews.AnimatedList({
                    el: $categoryPageBody.find('[data-mz-productlist] .mz-productlist-list'),
                    model: facetingModel
                }) : new ProductListViews.List({
                    el: $categoryPageBody.find('[data-mz-productlist]'),
                    model: facetingModel
                }) )
            };            if ($facetPanel.length > 0) {                facetingViews.facetPanel = new ProductListViews.FacetingPanel({
                    el: $facetPanel,                    model: facetingModel
                });            }
            Backbone.history.start({ pushState: true, root: window.location.pathname });
            var router = new Backbone.Router();

            facetingModel.on('facetchange', function () {
                var newURL, lrClone = JSON.parse(JSON.stringify(facetingModel.lastRequest));
                $.each(lrClone, function (p) { if (p in productListData.baseRequestParams) delete lrClone[p] });
                if (parseInt(lrClone.pageSize) === defaultPageSize) delete lrClone.pageSize;
                newURL = $.isEmptyObject(lrClone) ? "" : "?" + $.param(lrClone);
                router.navigate(newURL, { replace: true });
            });

            facetingModel.on('change:pageSize', facetingModel.updateFacets, facetingModel);

        }

        _.invoke(facetingViews, 'render');

        $categoryPageBody.noFlickerFadeIn();

        window.facetingViews = facetingViews;

    });
    
});