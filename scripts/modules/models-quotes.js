define(["modules/api", 'underscore', "modules/backbone-mozu", "hyprlive", "modules/models-product"], function (api, _, Backbone, Hypr, ProductModels, ReturnModels) {

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

        Quote = Backbone.MozuModel.extend({
            mozuType: 'quote',
            idAttribute: 'id',
            relations: {
                items: QuoteItemsList
            },
            handlesMessages: true,
            initialize: function () {
                var self = this;
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