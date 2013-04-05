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
                me.parentCart.submitting(false);
                me.parentCart.messages.push('Error removing item from cart.');
            });
        }
    }, function constructItem() {
        var self = this;
        this.priceIsModified = ko.computed(function () {
            var price = self.UnitPrice();
            return price.BaseAmount != price.FinalAmount;
        });
        this.apiModel.on('error', function (e) {
            self.parentCart.messages(e.Items);
            self.parentCart.submitting(false);
        });
        var origQuantity = this.Quantity();
        var changingQuantityPromise = false;
        this.Quantity.subscribe(function (newValue) {
            if (origQuantity !== newValue) {
                if (origQuantity === 0 && newValue > 0) {
                    self.parentCart.unQueueRemoval(self);
                }
                if (newValue === 0) {
                    self.parentCart.queueRemoval(self);
                } else {
                    if (changingQuantityPromise) {
                        changingQuantityPromise.cancel && changingQuantityPromise.cancel();
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
                origQuantity = newValue;
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
            var self = this,
                items = this.Items(),
                go = function() {
                    self.apiModel.checkout().then(function (order) {
                        self.publish('ordercreated', order);
                    });
                },
                chain = [go];
            self.submitting(true);
            $.each(this.removalQueue, function(ix) {
                var item = ko.utils.arrayFirst(items, function(i) {
                    return i.CartItemId = ix;
                });
                if (item) chain.unshift(function () {
                    return item.del();
                });
            });
            return self.apiModel.api.steps(chain);
        },
        queueRemoval: function (item) {
            this.removalQueue[item.CartItemId] = item;
        },
        unqueueRemoval: function (item) {
            delete this.removalQueue[item.CartItemId];
        }
    }, function constructCart() {
        var self = this;
        self.removalQueue = {};
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
