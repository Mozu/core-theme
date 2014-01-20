ApiObject.types.cartsummary = {
    count: function () {
        return this.data.totalQuantity || 0;
    }
};