define(['jquery', 'modules/api'], function ($, api) {
    $(document).ready(function () {
        var $cartCount = $('#mz-cart-count');
        function updateCartQuantity(apiObject) {
            if (apiObject.type === "cart") $cartCount.text(apiObject.data.Items.length);
        }
        api.on('sync', updateCartQuantity);
        api.on('spawn', updateCartQuantity);
    });
});