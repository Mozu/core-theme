ApiObject.types.shipment = utils.inherit(ApiObject, {
    getShippingMethodsFromContact: function (contact) {
        var self = this;
        return self.update({ FulfillmentContact: self.prop('FulfillmentContact') }).then(function () {
            return self.action('getShippingMethods');
        });
    }
});