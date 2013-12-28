/**
 * Watches for changes to the quantity of items in the shopping cart, to update
 * cart count indicators on the storefront.
 */
define(['modules/jquery-mozu', 'modules/api'], function ($, api) {
    $(document).ready(function () {
        var $cartCount = $('.mz-cartmonitor'), timeout;
        function waitAndGetCart() {
            return setTimeout(function() {
                api.get('cart').then(updateCartDetails);
            }, 500);
        }
        function checkForCartUpdates(apiObject) {
            if (!apiObject || !apiObject.type) return;
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
            $cartCount.text(cartObject.count() || 0);
        }
        api.on('sync', checkForCartUpdates);
        api.on('spawn', checkForCartUpdates);
        if (!require.mozuData('cart')) timeout = waitAndGetCart();
    });
});