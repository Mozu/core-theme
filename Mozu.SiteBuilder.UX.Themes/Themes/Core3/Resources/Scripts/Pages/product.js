require(["modules/jquery-plus", "modules/knockout-plus", "modules/models-product", "modules/product-images", "shim!vendor/jquery.tools.dateinput[jquery=jQuery]"], function ($, ko, ProductModels) {
   
    $(document).ready(function () {

        // gather view elements
        var $productView = $('#mz-product-detail');

        // this is tightly bound to the view existing, so don't run if it doesn't
        if ($productView.length == 0) return;

        var productData = $productView.mozuData('product');

        productData.Quantity = 1;

        // create the observable view model
        var product = new ProductModels.Product(productData);

         // initialize view
        function makeDatePicker(ix, option) {
            if (option.AttributeDetail.InputType === "Date") {
                var $newDateOptionInput = $('#datepicker_' + option.id);
                if (!$newDateOptionInput.length) return;
                $newDateOptionInput.dateinput({
                    format: 'mm/dd/yyyy',
                    max: option.maxDate,
                    min: option.minDate,
                });
                $newDateOptionInput.css('color', '#333');
            }
            option.beginLiveUpdate();
        }

        function createDatePickers() {
            $.each(product.Options(), makeDatePicker);
        }
        
        product.on('addedtocart', function (event, cartitem) {
            if (cartitem && cartitem.data && cartitem.data.CartItemId) {
                product.submitting(true);
                window.location.href = "/cart";
            } else {
                product.unknownError();
            }
        });

        // bind view!
        ko.applyBindings(product, $productView[0]);

        // build date pickers
        product.on('update', createDatePickers);
        createDatePickers();

        // reveal bound view, now that it's not an ugly template
        $productView.noFlickerFadeIn();

        window.productVM = product;

    });

});
