define(["shim!vendor/underscore>_", "modules/backbone-mozu"], function (_, Backbone) {

    var ProductPrice = Backbone.MozuModel.extend({
        defaults: {
            Price: 0,
            SalePrice: 0,
            OfferPrice: 0
        },
        helpers: ['OnSale', 'HasRange'],
        OnSale: function() {
            var salePrice = parseFloat(this.get('SalePrice'));
            return salePrice !== null && !isNaN(salePrice) && salePrice !== parseFloat(this.get("Price"));
        },
        HasRange: function() {
            return !isNaN(parseFloat(this.get("LowerBoundPrice")) + parseFloat(this.get("UpperBoundPrice")));
        }
    });

    return {
        ProductPrice: ProductPrice
    };

});