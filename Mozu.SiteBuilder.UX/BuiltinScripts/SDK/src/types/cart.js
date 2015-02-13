var utils = require('../utils');
var errors = require('../errors');
module.exports = (function () {

    errors.register({
        'ADD_COUPON_FAILED': 'Adding coupon failed for the following reason: {0}',
    });

    return {
        count: function () {
            var items = this.prop('items');
            if (!items || !items.length) return 0;
            return utils.reduce(items, function (total, item) { return total + item.quantity; }, 0);
        },
        addCoupon: function (couponCode) {
            var self = this;
            return this.applyCoupon(couponCode).then(function () {
                return self.get();
            }, function (reason) {
                errors.throwOnObject(self, 'ADD_COUPON_FAILED', reason.message);
            });
        }
    };
}());