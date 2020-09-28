var utils = require('../utils');
module.exports = {
    getShipmentsForOrder: function (orderId) {
        var self = this;
        return this.api.action('order', 'get-shipments', {
            orderId: orderId
        }).then(function (data) {
            return data.data;
        });
    }
};