define(["shim!vendor/jquery-cookie[jquery=jQuery]>jQuery", "knockout", "modules/knockout-viewmodel", "i18n!nls/messages", "modules/function-throttler"], function ($, ko, KnockoutVM, genericMsg, throttle) {

    var CartItem = KnockoutVM.extend({
        mozuType: 'cartitem',
        statics: {
            CartItemId: '',
            Product: ''
        },
        observables: {
            Quantity: { numeric: 0 },
            Total: { numeric: 2 },
            UnitPrice: {}
        },
        remove: function () {
            var me = this;
            this.del().then(function () {
                me.parentCart.get();
            }, function (err) {
                me.parentCart.submitting(false);
                me.parentCart.messages.push('Error removing item from cart.');
            });
        }
    }, function constructItem() {
        var self = this;
        this.parentCart = this.getParentModel();
        this.priceIsModified = ko.computed(function () {
            var price = self.UnitPrice();
            return price.BaseAmount != price.DiscountedAmount;
        });
        this.apiModel.on('error', function (e) {
            self.parentCart.messages(e.Items);
            self.parentCart.submitting(false);
        });
        var origQuantity = this.Quantity(), newValue, xhrCanceller;
        function hangOnToXhr(xhr, canceller, p, conf, data) {
            if (data === newValue) {
                xhrCanceller = canceller;
            }
        }
        this.Quantity.subscribe(throttle(function (val) {
            newValue = val;
            if (origQuantity !== newValue) {
                if (xhrCanceller) xhrCanceller();
                self.apiModel.api.on('request', hangOnToXhr);
                self.parentCart.submitting(true);
                self.updateQuantity(newValue).then(function () {
                    xhrCanceller = null;
                    self.apiModel.api.off('request', hangOnToXhr);
                    return self.parentCart.get();
                }).then(function () {
                    self.parentCart.submitting(false);
                });
                origQuantity = newValue;
            }
        }, 1000, false));
    });

    var Cart = KnockoutVM.extend({
        mozuType: 'cart',
        hasMessages: true,
        submodelArrays: {
            Items: CartItem
        },
        observables: {
            Total: {},
            hasDiscount: {},
        },
        proceedToCheckout: function () {
            var self = this;
            self.submitting(true);
            return self.checkout().then(function (order) {
                return self.publish('ordercreated', order);
            }, function () {
                self.submitting(false);
            });
        }
    }, function constructCart() {
        var self = this;

        this.isEmpty = ko.computed(function () {
            var items = self.Items();
            return items && items.length === 0;
        });

        this.canCheckout = ko.computed(function () {
            return !(self.submitting() || self.isEmpty());
        });

        this.count = ko.computed(function () {
            var sum = 0;
            $.each(self.Items(), function (ix, item) {
                sum += this.Quantity();
            });
            return isNaN(sum) ? 0 : sum;
        });
        

    });


    return {
        CartItem: CartItem,
        Cart: Cart
    };
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
