ApiObject.types.wishlist = (function() {

    errors.register({
        'NO_ITEMS_IN_WISHLIST': 'No items in wishlist.',
        'NO_MATCHING_ITEM_IN_WISHLIST': 'No wishlist item matching ID {0}'
    });

    var getItem = function (list, item) {
        var items = list.prop('items');
        if (!items || items.length === 0) {
            return errors.throwOnObject(list, 'NO_ITEMS_IN_WISHLIST');
        }
        if (typeof item === "string") {
            for (var i = items.length - 1; i >= 0; i--) {
                if (items[i].id === item) {
                    item = items[i];
                    break;
                }
            }
            if (typeof item === "string") {
                return errors.throwOnObject(list, 'NO_MATCHING_ITEM_IN_WISHLIST', item);
            }
        }
        return item;
    }

    return {
        getOrCreate: function () {
            var self = this;
            return this.getDefault().then(function(listOfWishlists) {
                return listOfWishlists.data.items.length === 0 ? self.createDefault() : listOfWishlists[0];
            });
        },
        addItemToCartById: function (item) {
            return this.addItemToCart(getItem(this, item));
        }
    };
}());