define(["jquery", "modules/knockout-plus", "modules/models-product", "modules/product-images"], function ($, ko, ProductModels) {
    // initialize view

    // due to a bug in jQuery.data that won't fully parse JSON embedded in attributes, we have to use a polyfill plugin.
    $.fn.mozuData = function (dataAttr) {
        var d = this.attr("data-" + dataAttr);
        return (typeof d === 'string' && d.charAt(0).match(/[\{\[\(]/)) ? $.parseJSON(d) : d;
    };

    $(document).ready(function () {

        // gather view elements
        var $productView = $('#mz-product-detail'),
            $priceView = $productView.find('.mz-price'),
            $addToCartButton = $('.mz-add-to-cart'),
            $optionContainer = $productView.find('.mz-configurator');

        // this is tightly bound to the view existing, so don't run if it doesn't
        if ($productView.length == 0) return;

        // map model data from json attributes
        var productData = {
            ProductCode: $productView.mozuData('product-code'),
            price: $priceView.mozuData('price'),
            config: {
                options: $optionContainer.mozuData('options'),
                purchasableState: {
                    isPurchasable: $addToCartButton.mozuData('purchasable-state')
                },
            },
            quantity: 1
        };

        // create the observable view model
        var product = new ProductModels.Product(productData);

        // update config after ajax
        product.config.whenServerUpdates(function (newData) {
            // the populate method would work, but we're unrolling the good parts here for a bitsy performance boost
            var messages = [];

            if (newData.variationProductCode) product.variationProductCode(newData.variationProductCode);
            if (newData.price) product.price.populate(newData.price);
            if (newData.purchasableState) product.config.purchasableState(newData.purchasableState);
            if (newData.options) product.config.options(newData.options);
            if (newData.messages) messages = messages.concat(newData.messages);
            if (newData.purchasableState && newData.purchasableState.messages) messages = messages.concat(newData.purchasableState.messages);

            product.messages(messages);
        });

        // go to the cart when complete
        product.whenServerUpdates(function (cartitem) {
            if (cartitem && cartitem.data.CartItemId) {
                product.submitting(true);
                window.location.href = "/cart";
            } else if (cartitem && cartitem.messages) {
                product.messages(cart.messages);
            } else {
                product.unknownError();
            }
        });

        // bind view!
        ko.applyBindings(product, $productView[0]);

        // reveal bound view, now that it's not an ugly template
        $productView.css('visibility', 'visible');

        // changing any of the options should result in an update
        $optionContainer.on('change keyup blur', function (e) {
            // get around knockout's habit of firing the change event twice for IE compatibility and causing a loop
            if (e.isTrigger) return;
            setTimeout(function () {
                product.config.submit()
            }, 50);
        });

        window.productVM = product;

    });

});
