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
        this.hasRange = ko.observable();
    });


    var ProductPriceRange = KnockoutVM.extend({
        observables: {
            Lower: {},
            Upper: {}
        }
    }, function () {
        var self = this;
        this.hasDiscountedUpper = ko.computed(function () {
            var upper = self.Upper();
            return upper.SalePrice && upper.SalePrice < upper.Price;
        });
        this.hasDiscountedLower = ko.computed(function () {
            var lower = self.Lower();
            return lower.SalePrice && lower.SalePrice < lower.Price;
        });
        this.hasDiscountedRange = ko.computed(function () {
            return self.hasDiscountedLower() || self.hasDiscountedUpper();
        });
    });

    return {
        ProductPrice: ProductPrice,
        ProductPriceRange: ProductPriceRange
    };

});