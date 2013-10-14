define(["shim!vendor/underscore>_", "modules/backbone-mozu"], function (_, Backbone) {

    var ProductPrice = Backbone.MozuModel.extend({
        dataTypes: {
            Price: Backbone.MozuModel.DataTypes.Float,
            SalePrice: Backbone.MozuModel.DataTypes.Float,
            OfferPrice: Backbone.MozuModel.DataTypes.Float
        },
        helpers: ['onSale'],
        onSale: function() {
            var salePrice = this.get('SalePrice');
            return salePrice !== null && !isNaN(salePrice) && salePrice !== this.get("Price");
        }
    }),

    ProductPriceRange = Backbone.MozuModel.extend({
        relations: {
            Lower: ProductPrice,
            Upper: ProductPrice
        }
    })

    return {
        ProductPrice: ProductPrice,
        ProductPriceRange: ProductPriceRange
    };

});