define(["jquery", "knockout", "modules/ko-component", "i18n!nls/messages"], function ($, ko, KOComponent, genericMsg) {

    var CartItem = KOComponent.extend({
        statics: {
            id: '',
            productCode: '',
            product: ''
        },
        observables: {
            quantity: { numeric: 0 },
            total: { numeric: 2 },
            unitPrice: {}
        },
        doNotSubmit: ["product", "total", "unitPrice"]
    }, function constructItem() {
        var self = this;
        this.oldQty = this.quantity();
        this.priceIsModified = ko.computed(function () {
            var price = self.unitPrice();
            return price.baseAmount != price.finalAmount;
        });
        this.quantityHasChanged = ko.computed(function () {
            return self.oldQty !== self.quantity();
        });
    });

    var Cart = KOComponent.extend({
        endpoint: '/cart',
        observableArrays: {
            items: { arrayOfType: CartItem }
        },
        observables: {
            total: {},
            hasDiscount: {},
        },
        removeItem: function (item) {
            this.items.remove(item);
        }
    }, function constructCart() {
        var self = this;

        this.isEmpty = ko.computed(function () {
            return self.items().length === 0;
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
