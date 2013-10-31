define(["shim!vendor/underscore>_", "modules/backbone-mozu"], function (_, Backbone) {

    var ProductPrice = Backbone.MozuModel.extend({
        dataTypes: {
            price: Backbone.MozuModel.DataTypes.Float,
            salePrice: Backbone.MozuModel.DataTypes.Float,
            offerPrice: Backbone.MozuModel.DataTypes.Float
        },
        helpers: ['onSale'],
        onSale: function() {
            var salePrice = this.get('salePrice');
            return salePrice !== null && !isNaN(salePrice) && salePrice !== this.get("price");
        }
    }),

    ProductPriceRange = Backbone.MozuModel.extend({
        relations: {
            lower: ProductPrice,
            upper: ProductPrice
        }
    })

    return {
        ProductPrice: ProductPrice,
        ProductPriceRange: ProductPriceRange
    };

});