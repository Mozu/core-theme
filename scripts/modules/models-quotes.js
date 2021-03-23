define(["modules/api", 'underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product",
    'modules/models-location'], function (api, _, Backbone, Hypr, ProductModels, LocationModels) {

    var QuoteItem = Backbone.MozuModel.extend({
        relations: {
            product: ProductModels.Product
        },
        helpers: ['uniqueProductCode'],
        uniqueProductCode: function () {
            //Takes into account product variation code
            var self = this,
                productCode = self.get('productCode');

            if (!productCode) {
                productCode = (self.get('product').get('variationProductCode')) ? self.get('product').get('variationProductCode') : self.get('product').get('productCode');
            }
            return productCode;
        },
        toJSON: function () {
            var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
            if (j.parent) {
                j.parent = j.parent.toJSON();
            }
            return j;
        }
    }),

        QuoteItemsList = Backbone.Collection.extend({
            model: QuoteItem
        }),

        StoreLocationsCache = Backbone.Collection.extend({
            addLocation: function (location) {
                this.add(new LocationModels.Location(location), { merge: true });
            },
            getLocations: function () {
                return this.toJSON();
            },
            getLocationByCode: function (code) {
                if (this.get(code)) {
                    return this.get(code).toJSON();
                }
            }
        }),

        Quote = Backbone.MozuModel.extend({
            mozuType: 'quote',
            idAttribute: 'id',
            relations: {
                items: QuoteItemsList,
                storeLocationsCache: StoreLocationsCache
            },
            handlesMessages: true,
            initialize: function () {
                var self = this;

                this.get("items").each(function (item, el) {
                    if (item.get('fulfillmentLocationCode') && item.get('fulfillmentLocationName')) {
                        self.get('storeLocationsCache').addLocation({
                            code: item.get('fulfillmentLocationCode'),
                            name: item.get('fulfillmentLocationName')
                        });
                    }
                });

            },
            toJSON: function () {
                var self = this,
                    jsonItems = [];
                this.get('items').each(function (item) {
                    jsonItems.push(item.toJSON());
                });
                this.set('items', jsonItems);
                var j = Backbone.MozuModel.prototype.toJSON.apply(this, arguments);
                return j;
            }
        }),

        QuoteCollection = Backbone.MozuPagedCollection.extend({
            mozuType: 'quotes',
            defaults: {
                pageSize: 5
            },
            relations: {
                items: Backbone.Collection.extend({
                    model: Quote
                })
            }
        });

    return {
        QuoteItem: QuoteItem,
        Quote: Quote,
        QuoteCollection: QuoteCollection
    };

});