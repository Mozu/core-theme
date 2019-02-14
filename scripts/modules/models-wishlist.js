define(["underscore", "modules/backbone-mozu", "modules/models-product"], function (_, Backbone, ProductModels) {
    var wishlistItem = Backbone.MozuModel.extend({});
    
    var wishlist = Backbone.MozuModel.extend({
        mozuType: 'wishlist',
        relations: {
            items: Backbone.Collection.extend({
                model: wishlistItem
            })
        }
    });
    
    return {
        Wishlist: wishlist,
        WishlistItem: wishlistItem
    };
});
