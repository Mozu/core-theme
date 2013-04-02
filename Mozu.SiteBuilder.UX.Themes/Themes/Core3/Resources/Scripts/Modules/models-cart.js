define(["shim!vendor/jquery-cookie[jquery=jQuery]>jQuery", "knockout", "modules/knockout-viewmodel", "i18n!nls/messages"], function ($, ko, KnockoutVM, genericMsg) {

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
                me.parentCart.messages.push('Error removing item from cart.');
            });
        }
    }, function constructItem() {
        var self = this;
        this.priceIsModified = ko.computed(function () {
            var price = self.UnitPrice();
            return price.BaseAmount != price.FinalAmount;
        });
        var origQuantity = this.Quantity();
        var changingQuantityPromise = false;
        this.Quantity.subscribe(function (newValue) {
            if (origQuantity && origQuantity !== newValue) {
                origQuantity = newValue;
                if (changingQuantityPromise) {
                    changingQuantityPromise.cancel();
                    changingQuantityPromise = false;
                }
                self.parentCart.submitting(true);
                changingQuantityPromise = self.updateQuantity(newValue).then(function () {
                    changingQuantityPromise = self.parentCart.get();
                    return changingQuantityPromise;
                }).then(function () {
                    self.parentCart.submitting(false);
                    changingQuantityPromise = false;
                });
            }
        });
    });

    var Cart = KnockoutVM.extend({
        mozuType: 'cart',
        hasMessages: true,
        observableArrays: {
            Items: {}
        },
        observables: {
            Total: {},
            hasDiscount: {},
        },
        checkout: function () {
            var self = this;
            self.submitting(true);
            this.apiModel.checkout().then(function (order) {
                //$.cookie.raw = true;
                //$.cookie('order', 'orderid=' + order.data.Id + ';', { path: '/' });
                self.publish('ordercreated', order);
            }, function (error) {
                self.submitting(false);
                self.messages(error.Items);
            });
        }
    }, function constructCart() {
        var self = this;

        // extract current value
        var items = this.Items();
        // private, underlying observablearray
        var _items = ko.observableArray();
        // public proxy observable
        this.Items = ko.computed({
            write: function (newArray) {
                if ($.isArray(newArray)) {
                    _items($.map(newArray, function (itemConf) {
                        itemConf.parentCart = self;
                        return new CartItem(itemConf);
                    }));
                } else {
                    // allow blanking the array out
                    _items(null);
                }
            },
            read: _items
        });

        // now populate it
        this.Items(items);

        this.isEmpty = ko.computed(function () {
            return self.Items().length === 0;
        });

        this.canCheckout = ko.computed(function () {
            return !(self.submitting() || self.isEmpty());
        });

        // run an extra sync because we don't get a full cart in the mozuData object for some reason
        this.get();
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
