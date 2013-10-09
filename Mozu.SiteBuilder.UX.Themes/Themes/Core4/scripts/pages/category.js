define(['modules/jquery-mozu', 'modules/backbone-mozu', 'shim!vendor/jquery.history[jquery=jQuery]>History', "modules/models-faceting", "modules/views-paging"], function($, Backbone, History, FacetingModels, PagingViews){

    var FacetingView = Backbone.MozuView.extend({
        additionalEvents: {
            "change [data-mz-facet-value]": "setFacetValue"
        },
        templateName: "Modules/Product/FacetingPanel",
        clearFacets: function () {
            this.model.clearAllFacets();
        },
        clearFacet: function (e) {
            this.model.get("Facets").findWhere({ Field: $(e.currentTarget).data('mz-facet') }).empty();
        },
        setFacetValue: function (e) {
            var $box = $(e.currentTarget);
            this.model.setFacetValue($box.data('mz-facet'), $box.data('mz-facet-value'), $box.is(':checked'));
        }
    });

    $(document).ready(function () {
        
        var $facetingForm = $('[data-mz-category]'),
            categoryId = $facetingForm.data('mz-category'),
            productListData = require.mozuData('facetedproducts'),
            defaultPageSize = 15;

        if (productListData) {
            productListData.baseRequestParams = {
                filter: 'categoryId req ' + categoryId,
                facetTemplate: 'categoryId:' + categoryId,
                facetHierValue: 'categoryId:' + categoryId,
                facetHierDepth: 'categoryId:2'
            };

            var facetingModel = new FacetingModels.FacetedProductCollection(productListData);            var facetingViews = window.facetingViews = {
                facetPanel: new FacetingView({
                    el: $('#mz-sidebar'),
                    model: facetingModel
                }),
                pagingControls: new PagingViews.PagingControls({
                    el: $facetingForm.find('[data-mz-pagingcontrols]'),
                    model: facetingModel
                }),
                pageNumbers: new PagingViews.PageNumbers({
                    el: $facetingForm.find('[data-mz-pagenumbers]'),
                    model: facetingModel
                }),
                productList: new Backbone.MozuView({
                    templateName: 'Modules/Product/ProductListingTiles',
                    el: $facetingForm.find('[data-mz-productlisting]'),
                    model: facetingModel
                })
            };
            facetingModel.on('facetchange', function () {
                var newURL, lrClone = JSON.parse(JSON.stringify(facetingModel.lastRequest));
                $.each(lrClone, function (p) { if (p in productListData.baseRequestParams) delete lrClone[p] });
                if (lrClone.pageSize === defaultPageSize) delete lrClone.pageSize;
                newURL = $.isEmptyObject(lrClone) ? window.location.href.replace(window.location.search, '') : "?" + $.param(lrClone);
                History.replaceState(null, null, newURL);
            });
        }

        _.invoke(facetingViews, 'render');

        $('#mz-category-loading').remove();
        $facetingForm.noFlickerFadeIn();


    });
    
});