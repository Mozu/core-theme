define(['modules/jquery-plus', 'knockout', 'shim!vendor/jquery.history[jquery=jQuery,shim!vendor/json2>JSON=JSON]>History', "modules/models-faceting"], function($, ko, History, FacetingModels){

    $(document).ready(function () {
        
        var $facetingForm = $('[data-mz-role=faceting]'),
            categoryId = $.getMozuData('category'),
            productListData = $facetingForm.mozuData('products'),
            defaultPageSize = parseInt($.getMozuData('defaultpagesize')),
            facetingVM;

        if (productListData) {
            productListData.baseRequestParams = {
                filter: 'categoryId req ' + categoryId,
                facetTemplate: 'categoryId:' + categoryId,
                facetHierValue: 'categoryId:' + categoryId,
                facetHierDepth: 'categoryId:2'
            };

            facetingVM = window.facetingVM = new FacetingModels.FacetedProductCollection(productListData);

            ko.applyBindings(facetingVM, $facetingForm[0]);
            facetingVM.PageSize.subscribe(function (newVal) {
                if (!facetingVM.isUpdating) facetingVM.updateFacets();
            });

            facetingVM.on('update', function () {
                var newURL, lrClone = JSON.parse(JSON.stringify(facetingVM.lastRequest));
                $.each(lrClone, function (p) { if (p in productListData.baseRequestParams) delete lrClone[p] });
                if (lrClone.pageSize === defaultPageSize) delete lrClone.pageSize;
                newURL = $.isEmptyObject(lrClone) ? window.location.href.replace(window.location.search, '') : "?" + $.param(lrClone);
                History.replaceState(null, null, newURL);
            });
        }

        $('#mz-category-loading').remove();
        $facetingForm.noFlickerFadeIn();


    });
    
});