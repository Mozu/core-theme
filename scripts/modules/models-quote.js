define(["underscore", "modules/backbone-mozu", "modules/models-product"], function (_, Backbone, ProductModels) {
    var quoteItem = Backbone.MozuModel.extend({});

    var quote = Backbone.MozuModel.extend({
        mozuType: 'quote',
        relations: {
            items: Backbone.Collection.extend({
                model: quoteItem
            })
        }
    });

    return {
        Quote: quote,
        QuoteItem: quoteItem
    };
});
