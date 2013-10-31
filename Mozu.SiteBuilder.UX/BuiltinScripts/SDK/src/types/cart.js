ApiObject.types.cart = utils.inherit(ApiObject, {
    count: function () {
        var items = this.prop('items');
        if (!items || !items.length) return 0;
        return utils.reduce(items, function (total, item) { return item.quantity; }, 0);
    }
});