define(["jquery", "modules/knockout-plus", "modules/models-product", "modules/product-images"], function ($, ko, ProductModels) {
    // initialize view

    $(document).ready(function () {

        // gather view elements
        var $productView = $('#mz-product-detail');

        // create the observable view model
        var product = new ProductModels.Product($productView);

        product.bindView();

        product.on('addtocart', function () {
            window.location = "/cart";
        });

        // reveal bound view, now that it's not an ugly template
        $productView.css('visibility', 'visible');

        // changing any of the options should result in an update
        $productView.find('[data-mz-role="configurator"]').on('change keyup blur', function (e) {
            // get around knockout's habit of firing the change event twice for IE compatibility and causing a loop
            if (e.isTrigger) return;
            setTimeout(function () {
                product.retrieve();
            }, 50);
        });

        window.productVM = product;

    });

});
