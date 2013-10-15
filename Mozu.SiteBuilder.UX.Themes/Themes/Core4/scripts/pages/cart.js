define(['modules/backbone-mozu', 'shim!vendor/underscore>_', 'modules/jquery-mozu', 'modules/models-cart'], function (Backbone, _, $, CartModels) {

    var CartView = Backbone.MozuView.extend({
        templateName: "modules/cart/cart-table",
        updateQuantity: _.debounce(function (e) {
            var $qField = $(e.currentTarget),
                newQuantity = parseInt($qField.val()),
                id = $qField.data('mz-cart-item'),
                item = this.model.get("Items").get(id);

            if (item && !isNaN(newQuantity)) {
                item.set('Quantity', newQuantity);
                item.saveQuantity();
            }
        },400),
        removeItem: function(e) {
            var $removeButton = $(e.currentTarget),
                id = $removeButton.data('mz-cart-item');
            this.model.get("Items").get(id).removeFromCart();
            return false;
        },
        proceedToCheckout: function () {
            this.model.toOrder();
            return false;
        }
    });

    $(document).ready(function () {

        var cartModel = CartModels.Cart.fromCurrent(),
            cartView = new CartView({
                el: $('#cart'),
                model: cartModel,
                messagesEl: $('[data-mz-message-bar]')
            });

        cartModel.on('ordercreated', function (order) {
            cartModel.isLoading(true);
            window.location = "/checkout/" + order.data.Id;
        });

        window.cartView = cartView;

    });

});