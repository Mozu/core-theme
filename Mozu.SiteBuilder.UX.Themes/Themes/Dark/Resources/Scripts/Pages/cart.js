define(["jquery", "knockout", "modules/knockout-viewmodel", "i18n!nls/messages"], function ($, ko, KnockoutVM, genericMsg) {

    var CartItem = KnockoutVM.extend({
        endpoint: '/cart/updatecartitem',
        statics: {
            parentCart: '',
            id: '',
            product: ''
        },
        observables: {
            quantity: { numeric: 0 },
            total: { numeric: 2 },
            unitPrice: {}
        },
        doNotSubmit: ["parentCart","product","total","unitPrice"],
        submitIfChanged: function () {
            if (this.oldQty != this.quantity()) {
                this.submit();
            }
        },
        remove: function () {
            this.quantity(0);
            this.submit();
        }
    }, function constructItem() {
        var self = this, parentCart = this.parentCart;
        this.oldQty = this.quantity();
        this.priceIsModified = ko.computed(function () {
            var price = self.unitPrice();
            return price.baseAmount != price.finalAmount;
        });
        this.whenServerUpdates(function (newData) {
            parentCart.populate(newData);
        });
    });

    var Cart = KnockoutVM.extend({
        observableArrays: {
            items: {}
        },
        observables: {
            total: {},
            hasDiscount: {},
        },
        updateItems: function () {
            ko.utils.arrayForEach(this.items(), function (item) {
                item.submitIfChanged();
            });
        }
    }, function constructCart() {
        var self = this;

        this.isEmpty = ko.computed(function () {
            return self.items().length === 0;
        });

        // extract current value
        var items = this.items();
        // private, underlying observablearray
        var _items = ko.observableArray();
        // public proxy observable
        this.items = ko.computed({
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
        this.items(items);
    });

    var $cartForm = $('#mz-cart-form')

    var cart = new Cart($cartForm.data('cart'));

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
