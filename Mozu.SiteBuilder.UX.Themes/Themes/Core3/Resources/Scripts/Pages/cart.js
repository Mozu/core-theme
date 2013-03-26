define(["modules/jquery-plus", "knockout", "modules/models-cart"], function ($, ko, CartModels) {
    $(document).ready(function () {
        var $cartForm = $('#mz-cart-form')

        var cart = new CartModels.Cart($cartForm.mozuData('cart'));

        window.cartVM = cart;

        ko.applyBindings(cart, $cartForm[0]);

        cart.on('ordercreated', function (e, order) {
            window.location = "/checkout/" + order.data.Id;
        });

    });
});
