define(['jquery', 'modules/api'], function ($, api) {
    $(document).ready(function () {
        var $cartCount = $('#mz-cart-count'), timeout;
        function waitAndGetCart() {
            return setTimeout(function() {
                api.get('cart').then(updateCartDetails);
            }, 2500);
        }
        function checkForCartUpdates(apiObject) {
            switch (apiObject.type) {
                case "cart":
                    clearTimeout(timeout);
                    updateCartDetails(apiObject);
                    break;
                case "cartitem":
                    timeout = waitAndGetCart();
                    break;
            }
        }
        function updateCartDetails(cartObject) {
            $cartCount.text(cartObject.data.Items.length);

        }
        api.on('sync', checkForCartUpdates);
        api.on('spawn', checkForCartUpdates);
        timeout = waitAndGetCart();
    });
});