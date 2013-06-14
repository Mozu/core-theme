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

         // initialize view        function applyUIFudges() {
            // we do this sad thing because knockout doesn't currently support a clean way to enable/disable individual options in an 'options' binding.
            $('[data-mz-role="optionselect"], [data-mz-role="optionmultiselect"]').each(function () {
                var option = ko.dataFor(this),
                    values = option.Values(),
                    j = 0,
                    $optionEls = $(this).find('option'),
                    oeLen = $optionEls.length;
                for (var i = values.length - 1; i >= 0; i--) {
                    j++;
                    if (!values[i].IsEnabled) $optionEls.eq(oeLen - j).addClass('mz-option-unavailable');
                }
            });
            // build date pickers
            createDatePickers();
        }
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

        // a couple of non-knockout-supported UI cheats we run every time knockout regenerates its US
        product.on('update', applyUIFudges);
        applyUIFudges();

        // reveal bound view, now that it's not an ugly template
        $productView.noFlickerFadeIn();

        window.productVM = product;

    });

});
