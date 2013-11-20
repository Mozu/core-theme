ApiObject.types.product = {
    addToWishlist: function (quantity) {
        var self = this;
        return this.api.createSync('wishlist').getOrCreate().then(function (wishlist) {
            return wishlist.addItem({ quantity: quantity, product: self.data });
        });
    }
};