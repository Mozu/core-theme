ApiObject.types.wishlist = {
    getOrCreate: function () {
        var self = this;
        return this.getDefault().then(function(listOfWishlists) {
            return listOfWishlists.data.items.length === 0 ? self.createDefault() : listOfWishlists[0];
        });
    }
};