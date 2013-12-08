ApiObject.types.product = {
    addToWishlist: function (payload) {
        var self = this;
        return this.api.createSync('wishlist', { customerAccountId: payload.customerAccountId }).getOrCreate().then(function (wishlist) {
            return wishlist.addItem({ quantity: payload.quantity, product: self.data });
        });
    }
};