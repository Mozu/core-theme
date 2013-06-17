define(['modules/jquery-plus', 'knockout', 'shim!vendor/jquery.history[jquery=jQuery]>History', "modules/models-faceting"], function($, ko, History, FacetingModels){

    $(document).ready(function () {
        
        var $facetingForm = $('[data-mz-role=faceting]'),
            productListData = $facetingForm.mozuData('products'),
            facetingVM;

        productListData.categoryId = $.getMozuData('category');

        facetingVM = window.facetingVM = new FacetingModels.FacetedProductCollection(productListData);

        ko.applyBindings(facetingVM, $facetingForm[0]);

        $('#mz-category-loading').remove();
        $facetingForm.noFlickerFadeIn();


        facetingVM.on('update', function () {
            var newURL, lrClone = JSON.parse(JSON.stringify(facetingVM.lastRequest));
            delete lrClone.filter;
            delete lrClone.facetTemplate;
            newURL = $.isEmptyObject(lrClone) ? window.location.href.replace(window.location.search, '') : "?" + $.param(lrClone);
            History.replaceState(null, null, newURL);
        });

    });
    
});