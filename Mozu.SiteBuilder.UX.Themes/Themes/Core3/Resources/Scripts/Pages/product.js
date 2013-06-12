require(["modules/jquery-plus", "modules/knockout-plus", "modules/models-product", "modules/product-images", "shim!vendor/jquery.tools.dateinput[jquery=jQuery]"], function ($, ko, ProductModels) {
    // initialize view    function createDatePicker(eventOrIndex, option) {
        if (option.AttributeDetail.InputType === "Date") {
            // this is the best thing we have to wait for render :/
            function makeDatePicker() {

            var $newDateOptionInput = $('#datepicker_' + option.id);
                if (!$newDateOptionInput.length) return setTimeout(makeDatePicker, 400);
                $newDateOptionInput.dateinput({
                    format: 'mm/dd/yyyy',
                    max: option.maxDate,
                    min: option.minDate,
                });
                $newDateOptionInput.css('color','#333');
            }
            setTimeout(makeDatePicker, 400);
        }
    }

    $(document).ready(function () {

        // gather view elements
        var $productView = $('#mz-product-detail'),
            $addToCartButton = $('.mz-add-to-cart'),
            $optionContainer = $productView.find('.mz-configurator');

        // this is tightly bound to the view existing, so don't run if it doesn't
        if ($productView.length == 0) return;

        var productData = $productView.mozuData('product');

        productData.Quantity = 1;

        // create the observable view model
        var product = new ProductModels.Product(productData);

        // update config after ajax
        //product.config.whenServerUpdates(function (newData) {
        //    // the populate method would work, but we're unrolling the good parts here for a bitsy performance boost
        //    var messages = [];

        //    if (newData.variationProductCode) product.variationProductCode(newData.variationProductCode);
        //    if (newData.price) product.price.populate(newData.price);
        //    if (newData.purchasableState) product.config.purchasableState(newData.purchasableState);
        //    if (newData.options) product.config.options(newData.options);
        //    if (newData.messages) messages = messages.concat(newData.messages);
        //    if (newData.purchasableState && newData.purchasableState.messages) messages = messages.concat(newData.purchasableState.messages);

        //    product.messages(messages);
        //});

        // go to the cart when complete
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
        product.on('optioncreated', createDatePicker);
        $.each(product.Options(), createDatePicker);

        // reveal bound view, now that it's not an ugly template
        $productView.noFlickerFadeIn();

        // changing any of the options should result in an update
        //$optionContainer.on('change keyup blur', function (e) {
        //    // get around knockout's habit of firing the change event twice for IE compatibility and causing a loop
        //    if (e.isTrigger) return;
        //    setTimeout(function () {
        //        product.configure({ Options: product.toJS().Options });
        //    }, 50);
        //});

        window.productVM = product;

    });

});
