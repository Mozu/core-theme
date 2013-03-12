define(["modules/jquery-plus", "knockout", "modules/models-cart"], function ($, ko, CartModels) {

    var $cartForm = $('#mz-cart-form')

    var cart = new CartModels.Cart($cartForm.mozuData('cart'));

    window.cartVM = cart;

    ko.applyBindings(cart, $cartForm[0]);

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
