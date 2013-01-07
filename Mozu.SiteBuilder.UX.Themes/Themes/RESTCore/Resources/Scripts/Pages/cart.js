define(["jquery", "knockout", "modules/models-cart"], function ($, ko, CartModels) {

    var $cartForm = $('#mz-cart-form')

    var cart = new CartModels.Cart($cartForm);

    // adding removal event this way to save verbosity in the template, see http://knockoutjs.com/documentation/unobtrusive-event-handling.html
    $cartForm.on('click', '[data-mz-action="removecartitem"]', function () {
        cart.removeItem(ko.dataFor(this));
        cart.update();
    });
    
    // cleanly doing autoupdate is difficult, because the cartitems keep getting recreated
    var cartItemSubscriptions = [],
        updateIfChanged = function (yes) {
            if (yes) cart.update();
        },
        subscribeAutoUpdate = function () {
            var sub;
            while (sub = cartItemSubscriptions.pop()) {
                sub.dispose();
            }
            ko.utils.arrayForEach(cart.items(), function(item) {
                cartItemSubscriptions.push(item.quantityHasChanged.subscribe(updateIfChanged));
            });
        };
    cart.on('populate', subscribeAutoUpdate);
    subscribeAutoUpdate();

    cart.bindView();

    window.cartVM = cart;

    // below is legacy discount code, as yet unimplemented

    //$("#applycoupon").click(function () {
    //    //window.location = "/cart/applycoupon/?couponcode=" + $("#coupon").val();
    //    send("/cart/applycoupon/", { couponcode: $("#coupon").val() }, function(data) {
    //        //console.log(data); // todo fix it
    //        $("#discount").show();
    //        $("#couponform").hide();
    //    });
    //});

    //$("#removediscount").click(function () { // intercept remove coupon hyperlink
    //    send(this.href, { couponCode: $(this).data('couponCode') }, function (data) {
    //        //console.log(data); // todo fix it
    //        $("#couponform").show();
    //        $("#discount").hide();
    //    });
    //    return false;
    //});

});
