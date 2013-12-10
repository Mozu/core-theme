ApiObject.types.product = {
    addToWishlist: function (payload) {
        var self = this;
        var list = this.api.createSync('wishlist', { customerAccountId: payload.customerAccountId });
        errors.passFrom(list, this);
        return list.getOrCreate().then(function () {
            return list.addItem({ quantity: payload.quantity, product: self.data });
        });
    }
};