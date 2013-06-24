define(['modules/jquery-plus', 'modules/api'], function ($, api) {
    $(document).ready(function () {
        var $cartCount = $('#mz-cart-count'), timeout;
        function waitAndGetCart() {
            return setTimeout(function() {
                api.get('cart').then(updateCartDetails);
            }, 500);
        }
        function checkForCartUpdates(apiObject) {
            switch (apiObject.type) {
                case "cart":
                    clearTimeout(timeout);
                    updateCartDetails(apiObject);
                    break;
                case "cartitem":
                    if (!apiObject.unsynced) timeout = waitAndGetCart();
                    break;
            }
        }
        function updateCartDetails(cartObject) {
            var sum = 0;
            $.each(cartObject.data.Items, function (ix, item) {
                sum += item.Quantity;
            });
            if (!isNaN(sum)) $cartCount.text(sum);

        }
        api.on('sync', checkForCartUpdates);
        api.on('spawn', checkForCartUpdates);
        var initial = $.getMozuData('cart');
        if (initial) {
            checkForCartUpdates(initial);
        } else {
            timeout = waitAndGetCart();
        }
    });
});