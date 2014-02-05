/**
 * Watches for changes to the quantity of items in the shopping cart, to update
 * cart count indicators on the storefront.
 */
define(['modules/jquery-mozu', 'modules/api'], function ($, api) {

    $(document).ready(function () {
        var $cartCount = $('[data-mz-role="cartmonitor"]'), timeout;
        function waitAndGetCart() {
            return setTimeout(function() {
                api.get('cartsummary').then(function (summary) {
                    updateCartCount(summary.count());
                });
            }, 500);
        }
        function checkForCartUpdates(apiObject) {
            if (!apiObject || !apiObject.type) return;
            switch (apiObject.type) {
                case "cart":
                case "cart-summary":
                    clearTimeout(timeout);
                    updateCartCount(apiObject.count() || 0);
                    break;
                case "cartitem":
                    if (!apiObject.unsynced) timeout = waitAndGetCart();
                    break;
            }
        }
        function updateCartCount(count) {
            $cartCount.text(count);
            $.cookie('mozucartcount', count, { path: '/' });
        }
        api.on('sync', checkForCartUpdates);
        api.on('spawn', checkForCartUpdates);
        var savedCount = $.cookie('mozucartcount');
        if (savedCount === null) waitAndGetCart();
        $cartCount.text(savedCount || 0);
    });

});