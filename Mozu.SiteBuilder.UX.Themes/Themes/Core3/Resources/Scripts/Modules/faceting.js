define(['modules/jquery-plus', 'knockout', 'shim!vendor/jquery.history[jquery=jQuery]>History', "modules/models-faceting"], function($, ko, History, FacetingModels){

    $(document).ready(function () {
        
        var $facetingForm = $('[data-mz-role=faceting]'),
            facetingVM = window.facetingVM = new FacetingModels.FacetedProductCollection($facetingForm.mozuData('products'));

        ko.applyBindings(facetingVM, $facetingForm[0]);

        $('#mz-category-loading').remove();
        $facetingForm.noFlickerFadeIn();

        facetingVM.categoryId = $.getMozuData('category');

        facetingVM.on('update', function () {
            var fVF = facetingVM.getFacetValueFilter(),
                fVFullParam = fVF ? '?facetValueFilter=' + encodeURIComponent(fVF) : window.location.href.replace(window.location.search,'');
            History.replaceState(null, null, fVFullParam);
        });

    });
    
});