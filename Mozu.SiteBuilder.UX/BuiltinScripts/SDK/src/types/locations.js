ApiCollection.types.locations = (function () {

    return {
        getForProduct: function (opts) {
            var self = this,
                coll,
                // not running the method on self since it shouldn't sync until it's been processed!
                operation = opts.location ?
                this.api.action('locations', 'get-by-lat-long', {
                    latitude: opts.location.coords.latitude,
                    longitude: opts.location.coords.longitude
                }) :
                this.api.get('locations');
            return operation.then(function (c) {
                coll = c;
                var codes = utils.map(coll.data.items, function (loc) {
                    return loc.code;
                }).join(',');
                return self.api.action('product', 'getInventory', {
                    productCode: opts.productCode,
                    locationCodes: codes
                });
            }).then(function (inventory) {
                var j,
                    ilen,
                    locations = coll.data.items,
                    inventories = inventory.items,
                    validLocations = [];
                for (var i = 0, len = locations.length; i < len; i++) {
                    for (j = 0, ilen = inventories.length; j < ilen; j++) {
                        if (inventories[j].locationCode === locations[i].code) {
                            locations[i].quantity = inventories[j].stockAvailable;
                            validLocations.push(locations[i]);
                            inventories.splice(j, 1);
                            break;
                        }
                    }
                }
                var data = { items: utils.clone(validLocations) };
                self.fire('sync', data, data);
                return self;
            });
        }
    }

}());