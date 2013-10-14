define(['modules/jquery-mozu', 'modules/api'], function ($, api) {
    $(document).ready(function () {
        var $cartCount = $('.mz-cartmonitor'), timeout;
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
        var initial = require.mozuData('cart');
        if (initial) {
            checkForCartUpdates({ data: initial });
        } else {
            timeout = waitAndGetCart();
        }
    });
});