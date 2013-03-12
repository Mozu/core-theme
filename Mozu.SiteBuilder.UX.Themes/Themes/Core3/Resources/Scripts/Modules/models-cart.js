define(["jquery", "knockout", "modules/knockout-viewmodel", "i18n!nls/messages"], function ($, ko, KnockoutVM, genericMsg) {

    var CartItem = KnockoutVM.extend({
        mozuType: 'cartitem',
        statics: {
            parentCart: '',
            CartItemId: '',
            Product: ''
        },
        observables: {
            Quantity: { numeric: 0 },
            Total: { numeric: 2 },
            UnitPrice: {}
        },
        doNotSubmit: ['parentCart'],
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
        this.Quantity.subscribe(function (newValue) {
            self.parentCart.submitting(true);
            self.apiModel.data.Quantity = newValue;
            self.apiModel.action('update', self.apiModel.data).then(function () {
                self.parentCart.get();
            });
        });
    });

    var Cart = KnockoutVM.extend({
        mozuType: 'cart',
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
            this.apiModel.checkout().then(function () {
                window.location = "checkout";
            }, function (error) {
                self.messages.push(error.message);
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
