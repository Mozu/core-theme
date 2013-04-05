define(["jquery", "modules/knockout-plus", "modules/knockout-viewmodel"], function ($, ko, KnockoutVM) {

    var ProductPrice = KnockoutVM.extend({
        observables: {
            Price: { numeric: 2 },
            SalePrice: {
                numeric: {
                    precision: 2,
                    nullable: true
                }
            },
            DiscountId: {},
            DiscountName: {},
            OfferPrice: {
                numeric: {
                    precision: 2,
                    nullable: true
                }
            }
        }
    }, function constructProductPrice() {
        var me = this;
        this.hasSalePrice = ko.computed(function () {
            var salePrice = me.SalePrice();
            return salePrice !== null && !isNaN(salePrice);
        });
        this.hasRange = ko.computed(function () {
            return !isNaN(me.LowerBoundPrice + me.UpperBoundPrice);
        });
    });

    return {
        ProductPrice: ProductPrice
    };

});