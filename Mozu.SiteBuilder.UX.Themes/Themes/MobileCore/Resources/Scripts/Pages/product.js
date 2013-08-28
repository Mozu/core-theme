require(["modules/jquery-plus", "modules/knockout-plus", "modules/models-product", "modules/product-images"], function ($, ko, ProductModels) {
   
    $(document).ready(function () {

        // gather view elements
        var $productView = $('#mz-product-detail');

        // this is tightly bound to the view existing, so don't run if it doesn't
        if ($productView.length == 0) return;

        var productData = $productView.mozuData('product');

        productData.Quantity = 1;

        // create the observable view model
        var product = new ProductModels.Product(productData);

        product.on('addedtocart', function (event, cartitem) {
            if (cartitem && cartitem.data && cartitem.data.Id) {
                product.submitting(true);
                window.location.href = "/cart";
            } else {
                product.unknownError();
            }
        });

        // bind view!
        ko.applyBindings(product, $productView[0]);

        $.each(product.Options(), function (i, o) {
            return o.beginLiveUpdate();
        });

        // reveal bound view, now that it's not an ugly template
        $productView.noFlickerFadeIn();

        window.productVM = product;

    });

});
