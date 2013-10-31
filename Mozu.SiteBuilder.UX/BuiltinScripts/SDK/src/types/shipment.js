ApiObject.types.shipment = utils.inherit(ApiObject, {
    getShippingMethodsFromContact: function (contact) {
        var self = this;
        return self.update({ fulfillmentContact: self.prop('fulfillmentContact') }).then(function () {
            return self.action('getShippingMethods');
        });
    }
});